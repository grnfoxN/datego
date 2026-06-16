"""initial schema

Revision ID: 0001
Revises:
Create Date: 2024-01-01
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('avatar_url', sa.String(500)),
        sa.Column('telegram_id', sa.BigInteger(), unique=True),
        sa.Column('telegram_chat_id', sa.BigInteger()),
        sa.Column('telegram_username', sa.String(255)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()')),
    )

    op.create_table('auth_tokens',
        sa.Column('token', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('telegram_chat_id', sa.BigInteger(), nullable=True),
        sa.Column('confirmed', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()')),
        sa.Column('expires_at', sa.DateTime(), server_default=sa.text("NOW() + INTERVAL '10 minutes'")),
    )

    op.create_table('cards',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), primary_key=True),
        sa.Column('emoji', sa.String(10), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('category', sa.String(100)),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
    )

    op.create_table('offers',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('token', sa.String(100), unique=True, nullable=False),
        sa.Column('status', sa.String(50), server_default='active'),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('photo_url', sa.String(500)),
        sa.Column('selection_type', sa.String(20), server_default='single'),
        sa.Column('date_mode', sa.String(20), server_default='free'),
        sa.Column('date_from', sa.Date()),
        sa.Column('date_to', sa.Date()),
        sa.Column('time_from', sa.Time()),
        sa.Column('time_to', sa.Time()),
        sa.Column('custom_question', sa.Text()),
        sa.Column('custom_question_options', postgresql.JSONB()),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()')),
    )

    op.create_table('offer_cards',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), primary_key=True),
        sa.Column('offer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('offers.id')),
        sa.Column('card_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('cards.id'), nullable=True),
        sa.Column('custom_emoji', sa.String(10)),
        sa.Column('custom_title', sa.String(255)),
        sa.Column('custom_description', sa.Text()),
        sa.Column('sort_order', sa.Integer(), server_default='0'),
    )

    op.create_table('selections',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), primary_key=True),
        sa.Column('offer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('offers.id'), unique=True),
        sa.Column('selected_offer_card_ids', postgresql.ARRAY(postgresql.UUID(as_uuid=True))),
        sa.Column('selected_date', sa.Date(), nullable=False),
        sa.Column('selected_time', sa.Time(), nullable=False),
        sa.Column('custom_question_answer', sa.Text()),
        sa.Column('comment', sa.Text()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()')),
    )


def downgrade():
    op.drop_table('selections')
    op.drop_table('offer_cards')
    op.drop_table('offers')
    op.drop_table('cards')
    op.drop_table('auth_tokens')
    op.drop_table('users')
