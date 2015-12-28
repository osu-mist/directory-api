package edu.oregonstate.mist.directoryapi

import com.codahale.metrics.health.HealthCheck
import com.codahale.metrics.health.HealthCheck.Result
import org.ldaptive.LdapException

class LDAPHealthCheck extends HealthCheck {
    private final DirectoryEntityDAO directoryEntityDAO

    public LDAPHealthCheck(DirectoryEntityDAO directoryEntityDAO) {
        this.directoryEntityDAO = directoryEntityDAO
    }

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
