package edu.oregonstate.mist.directoryapi

import com.codahale.metrics.health.HealthCheck
import com.codahale.metrics.health.HealthCheck.Result
import org.ldaptive.LdapException

/**
 * LDAP health check.
 */
class LDAPHealthCheck extends HealthCheck {
    private final DirectoryEntityDAO directoryEntityDAO

    /**
     * Constructs LDAP health check using directory entity data access object.
     *
     * @param directoryEntityDAO
     */
    public LDAPHealthCheck(DirectoryEntityDAO directoryEntityDAO) {
        this.directoryEntityDAO = directoryEntityDAO
    }

    /**
     * Verifies that LDAP connection is successful.
     *
     * @return result
     */
    @Override
    protected Result check() {
        try {
            directoryEntityDAO.getByOSUUID(0)
            return Result.healthy()
        } catch(LdapException ldapException) {
            return Result.unhealthy(ldapException.message)
        }
    }
}
