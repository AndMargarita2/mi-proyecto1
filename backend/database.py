from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_migrations() -> None:
    """Altera tablas ya existentes para columnas nuevas: Base.metadata.create_all
    solo crea tablas que faltan, no agrega columnas a las que ya existen."""
    inspector = inspect(engine)
    if "presentations" not in inspector.get_table_names():
        return
    columns = {col["name"] for col in inspector.get_columns("presentations")}
    if "category" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE presentations ADD COLUMN category VARCHAR NOT NULL DEFAULT 'tech'")
            )
