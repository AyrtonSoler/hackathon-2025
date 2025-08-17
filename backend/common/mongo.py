# common/mongo.py
"""
Mongo/GridFS deshabilitado temporalmente para este release.
Cualquier uso directo debe eliminarse del código de vistas/servicios.
"""

def _disabled():
    raise RuntimeError("Mongo/GridFS deshabilitado para este release. "
                       "Quita los imports de common.mongo y reemplaza el flujo.")


def client():
    _disabled()


def db():
    _disabled()


def fs():
    _disabled()