"""Datos de ejemplo para que el home/catálogo no se vean vacíos.

Uso: python seed.py  (con el venv del backend activado)
"""

from auth import hash_password
from database import Base, SessionLocal, engine
from models import STATUS_APPROVED, Presentation, User


def _text_slide(slide_id: int, title: str, subtitle: str, bg: str) -> dict:
    return {
        "id": slide_id,
        "backgroundColor": bg,
        "elements": [
            {
                "id": f"text-{slide_id}-1",
                "type": "text",
                "x": 120,
                "y": 220,
                "width": 900,
                "height": 100,
                "content": title,
                "color": "#111827",
                "fontSize": 48,
                "fontWeight": "bold",
                "textAlign": "left",
            },
            {
                "id": f"text-{slide_id}-2",
                "type": "text",
                "x": 120,
                "y": 340,
                "width": 800,
                "height": 60,
                "content": subtitle,
                "color": "#374151",
                "fontSize": 22,
                "fontWeight": "normal",
                "textAlign": "left",
            },
        ],
    }


ADMIN_USER = {
    "email": "maestro@example.com",
    "password": "maestro1234",
    "display_name": "Maestro (Admin)",
}

DEMO_USERS = [
    {"email": "demo1@example.com", "password": "demo1234", "display_name": "Equipo Tecnologia"},
    {"email": "demo2@example.com", "password": "demo1234", "display_name": "Daniel Ortega"},
]

DEMO_PRESENTATIONS = [
    {
        "owner_email": "demo1@example.com",
        "title": "Como empezar a usar Linux",
        "category": "tech",
        "slides": [
            _text_slide(1, "Como empezar a usar Linux", "Guia rapida para principiantes", "#ffffff"),
            _text_slide(2, "Elige una distribucion", "Ubuntu, Fedora, Debian...", "#f8fafc"),
        ],
    },
    {
        "owner_email": "demo1@example.com",
        "title": "CPU vs GPU",
        "category": "tech",
        "slides": [
            _text_slide(1, "CPU vs GPU", "Arquitecturas y casos de uso", "#0f172a"),
        ],
    },
    {
        "owner_email": "demo2@example.com",
        "title": "Procesadores: ARM vs x86",
        "category": "tech",
        "slides": [
            _text_slide(1, "ARM vs x86", "Diferencias clave de arquitectura", "#ffffff"),
            _text_slide(2, "Eficiencia energetica", "Por que ARM domina en moviles", "#f1f5f9"),
        ],
    },
    {
        "owner_email": "demo2@example.com",
        "title": "Seguridad informatica",
        "category": "tech",
        "slides": [
            _text_slide(1, "Seguridad informatica", "Buenas practicas basicas", "#ffffff"),
        ],
    },
]


def run() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Ya hay datos, no se vuelve a sembrar.")
            return

        admin = User(
            email=ADMIN_USER["email"],
            display_name=ADMIN_USER["display_name"],
            hashed_password=hash_password(ADMIN_USER["password"]),
            status=STATUS_APPROVED,
            is_admin=True,
        )
        db.add(admin)

        users_by_email: dict[str, User] = {}
        for u in DEMO_USERS:
            user = User(
                email=u["email"],
                display_name=u["display_name"],
                hashed_password=hash_password(u["password"]),
                status=STATUS_APPROVED,
                is_admin=False,
            )
            db.add(user)
            users_by_email[u["email"]] = user
        db.flush()

        for p in DEMO_PRESENTATIONS:
            db.add(
                Presentation(
                    owner_id=users_by_email[p["owner_email"]].id,
                    title=p["title"],
                    category=p["category"],
                    slides=p["slides"],
                )
            )

        db.commit()
        print(f"Sembrado: 1 admin, {len(DEMO_USERS)} usuarios, {len(DEMO_PRESENTATIONS)} presentaciones.")
        print(f"Admin (maestro): {ADMIN_USER['email']} / {ADMIN_USER['password']}")
        print("Usuarios demo (contraseña 'demo1234'):", ", ".join(u["email"] for u in DEMO_USERS))
    finally:
        db.close()


if __name__ == "__main__":
    run()
