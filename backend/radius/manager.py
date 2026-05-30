from django.db import connections
import logging

logger = logging.getLogger(__name__)

class RadiusManager:
    def __init__(self, db_alias='default'):
        # In this project, we assume FreeRADIUS tables are in the same PostgreSQL DB
        self.db_alias = db_alias

    def create_user(self, username, password):
        """Create or update a RADIUS user."""
        with connections[self.db_alias].cursor() as cursor:
            # Cleartext-Password is standard for simple auth
            cursor.execute(
                "DELETE FROM radcheck WHERE username = %s AND attribute = 'Cleartext-Password'",
                [username]
            )
            cursor.execute(
                "INSERT INTO radcheck (username, attribute, op, value) VALUES (%s, %s, %s, %s)",
                [username, 'Cleartext-Password', ':=', password]
            )

    def set_package_attributes(self, username, duration_seconds, data_limit_bytes=0):
        """Set session limits in radreply."""
        with connections[self.db_alias].cursor() as cursor:
            # Remove old attributes
            cursor.execute("DELETE FROM radreply WHERE username = %s", [username])
            
            # Session Timeout
            cursor.execute(
                "INSERT INTO radreply (username, attribute, op, value) VALUES (%s, %s, %s, %s)",
                [username, 'Session-Timeout', ':=', str(duration_seconds)]
            )
            
            # Data Limit (if any)
            if data_limit_bytes > 0:
                # Max-Octets is standard for data capping
                cursor.execute(
                    "INSERT INTO radreply (username, attribute, op, value) VALUES (%s, %s, %s, %s)",
                    [username, 'Max-Octets', ':=', str(data_limit_bytes)]
                )
            
            # Simultaneous-Use (limit to 1 device)
            # This often goes in radcheck
            cursor.execute(
                "DELETE FROM radcheck WHERE username = %s AND attribute = 'Simultaneous-Use'",
                [username]
            )
            cursor.execute(
                "INSERT INTO radcheck (username, attribute, op, value) VALUES (%s, %s, %s, %s)",
                [username, 'Simultaneous-Use', ':=', '1']
            )

    def delete_user(self, username):
        """Remove user from RADIUS."""
        with connections[self.db_alias].cursor() as cursor:
            cursor.execute("DELETE FROM radcheck WHERE username = %s", [username])
            cursor.execute("DELETE FROM radreply WHERE username = %s", [username])
