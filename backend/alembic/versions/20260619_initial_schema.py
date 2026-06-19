"""Create initial 16 multi-tenant Enterprise tables with composite indexes.

Revision ID: 20260619_initial_schema
Revises: 
Create Date: 2026-06-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260619_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Let SQLAlchemy execute the declarative create_all to perfectly align multi-tenant tables
    from app.database import engine
    from app.models import Base
    Base.metadata.create_all(bind=engine)


def downgrade() -> None:
    from app.database import engine
    from app.models import Base
    Base.metadata.drop_all(bind=engine)
