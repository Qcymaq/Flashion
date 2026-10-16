from app.routes import auth as auth_module


def _routes():
    return {
        (route.path, method)
        for route in auth_module.router.routes
        for method in getattr(route, "methods", set())
    }


def test_free_membership_upgrade_route_is_removed():
    paths = {path for path, _ in _routes()}
    assert "/membership/upgrade" not in paths
    assert not hasattr(auth_module, "upgrade_membership")


def test_admin_approved_upgrade_request_flow_is_still_available():
    routes = _routes()
    assert ("/membership/upgrade-request", "POST") in routes
    assert ("/membership/upgrade-request/status", "GET") in routes
