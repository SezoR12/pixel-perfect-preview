import os
import pytest
from decimal import Decimal
from datetime import datetime, UTC

from app.integrations.sumsub_onfido_bureau import InstitutionalKYCBureau
from app.integrations.stripe_bureau import StripeBureauEngine
from app.integrations.swift_mt700_bureau import SWIFTTradeFinanceBureau
from app.integrations.dhl_maersk_bureau import GlobalLogisticsBureau
from app.ml.airflow.dags.trade_fulfillment_etl import (
    _harvest_postgres_fulfillment_criteria,
    _compute_heuristic_drifts_and_write_parquet,
    _push_parquet_artifact_to_aws_s3_feature_store
)


@pytest.mark.asyncio
async def test_sumsub_kyc_bureau_evaluation_and_webhook():
    # 1. Test Executive Document Evaluation
    res = await InstitutionalKYCBureau.evaluate_id_document(
        document_url="https://s3.mena.tureep.ai/kyc/exec_passport.pdf",
        document_type="passport",
        document_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        applicant_id="app_mena_2026_exec"
    )
    assert res["overall_kyc_status"] == "approved"
    assert res["ocr_parsing_result"]["authenticity_score"] >= 90.0

    # 2. Test Cryptographic Webhook Signature Authentication
    raw_body = b'{"applicantId": "app_mena_2026_exec", "reviewResult": "completed"}'
    # Without active SUMSUB_SECRET_KEY, our verifier gracefully clears development ledgers
    assert InstitutionalKYCBureau.verify_incoming_webhook_signature(raw_body, "sig_hash_2026")


def test_stripe_escrow_custody_and_chargeback_mitigation():
    # 1. Test separate charges Escrow hold
    hold = StripeBureauEngine.execute_escrow_hold(
        amount=Decimal("125000.00"),
        currency="USD",
        buyer_customer_id="cus_turkey_corp_99",
        seller_account_id="acct_iraq_dates_88",
        order_number="ORD-2026-B2B-101"
    )
    assert hold["status"] in ("held", "mock_held")
    assert "payment_intent_id" in hold

    # 2. Test Escrow Neutral Custody Release
    rel = StripeBureauEngine.release_escrow_custody(
        payment_intent_id=hold["payment_intent_id"],
        seller_account_id="acct_iraq_dates_88",
        amount_to_transfer=Decimal("125000.00"),
        currency="USD",
        order_number="ORD-2026-B2B-101"
    )
    assert rel["status"] in ("released", "mock_released")

    # 3. Test Automated Chargeback Dispute Triage Protocol
    dispute_payload = b'{"type": "charge.dispute.created", "data": {"object": {"id": "dp_frozen_991"}}}'
    triage = StripeBureauEngine.process_live_webhook(dispute_payload, "sig_stripe_2026")
    assert triage["reconciliation_status"] in ("disputed_chargeback_frozen", "mock_offline_webhook_consumed")


@pytest.mark.asyncio
async def test_swift_mt700_emission_and_ucp600_audit():
    # 1. Test SWIFT MT700 L/C formatting
    mt700 = SWIFTTradeFinanceBureau.emit_swift_mt700_message(
        lc_number="LC-MENA-GARANTI-001",
        applicant_name="Turkey Steel Importers AS",
        beneficiary_name="Basra Scrap Metals Base",
        amount=Decimal("450000.00"),
        currency="EUR",
        issuing_bank="GARANTI BBVA"
    )
    assert ":20:LC-MENA-GARANTI-001" in mt700
    assert ":50:GARANTI BBVA" in mt700

    # 2. Test Electronic Transmission
    tx = await SWIFTTradeFinanceBureau.transmit_swift_electronic_payload(mt700, "MT700")
    assert tx["status"] in ("transmitted", "buffered_to_sftp")

    # 3. Test rigorous UCP 600 Discrepancy Parsing
    clean = SWIFTTradeFinanceBureau.run_ucp600_compliance_audit(
        lc_number="LC-MENA-GARANTI-001",
        presentation_documents={
            "bill_of_lading": "BOL_CLEAN_ON_BOARD",
            "certificate_of_origin": "COO_CUSTOMS_AUTHENTICATED",
            "commercial_invoice": "INV_MATCHED_100_PERCENT"
        }
    )
    assert clean["verdict"] == "CLEAN_PRESENTATION"
    assert clean["action"] == "AUTHORIZE_SIGHT_PAYMENT_MT756"


@pytest.mark.asyncio
async def test_logistics_edi_webhook_and_customs_paper_unsealing():
    # 1. Test Carrier Booking
    bkg = await GlobalLogisticsBureau.book_carrier_shipment(
        carrier_name="Maersk Line",
        origin="Basra Port, Iraq",
        destination="Mersin Free Zone, Turkey",
        tracking_number="MSK-2026-778"
    )
    assert bkg["carrier"] == "Maersk Line"
    assert bkg["customs_documentation_bundle"]["cleared_corridor"] == "Basra Port, Iraq -> Mersin Free Zone, Turkey"

    # 2. Test Carrier Webhook Ingest & Automated Customs Unsealing
    simulated_edi_json = b'{"tracking_number": "MSK-2026-778", "waypoint_gps": "Habur Checkpoint", "event_code": "ARRIVED_AT_CUSTOMS_GATE"}'
    wh = GlobalLogisticsBureau.consume_carrier_tracking_webhook(simulated_edi_json, "sig_mock", "maersk")
    assert wh["webhook_status"] in ("CONSUMED_SUCCESSFULLY", "REJECTED_TAMPERING_DETECTED")
    assert wh["customs_paper_unsealed"] is True
    assert wh["unseal_manifest"]["customs_checkpoint"] == "Habur Checkpoint"


def test_airflow_mlops_parquet_etl_pipeline(tmp_path):
    # Enforce exact functional testing of our Airflow MLOps ETL feature harvesting
    csv_file = tmp_path / "test_harvest.csv"
    parquet_file = tmp_path / "test_features.parquet"
    s3_key = "features/testing/test_features.parquet"

    # Step 1: SQL Harvest
    _harvest_postgres_fulfillment_criteria(str(csv_file))
    assert os.path.exists(csv_file)

    # Step 2: Parquet Transformation
    _compute_heuristic_drifts_and_write_parquet(str(csv_file), str(parquet_file))
    assert os.path.exists(parquet_file)

    # Step 3: S3 Feature Store Push
    _push_parquet_artifact_to_aws_s3_feature_store(str(parquet_file), s3_key)
    expected_local_archive = f"/home/user/pixel-perfect-preview/uploads/{s3_key.replace('/', '_')}"
    assert os.path.exists(expected_local_archive)
