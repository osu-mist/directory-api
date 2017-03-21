package edu.oregonstate.mist.directoryapi

import edu.oregonstate.mist.api.Application
import io.dropwizard.setup.Environment

/**
 * Main application class.
 */
class DirectoryApplication extends Application<DirectoryApplicationConfiguration> {
    /**
     * Parses command-line arguments and runs the application.
     *
     * @param configuration
     * @param environment
     */
    @Override
    public void run(DirectoryApplicationConfiguration configuration, Environment environment) {
        this.setup(configuration, environment)

        final DirectoryEntityDAO DIRECTORYENTITYDAO = new DirectoryEntityDAO(
                configuration.getLdapConfiguration()
        )

        environment.healthChecks().register('LDAP', new LDAPHealthCheck(DIRECTORYENTITYDAO))
        environment.jersey().register(new DirectoryEntityResource(DIRECTORYENTITYDAO))
    }

    /**
     * Instantiates the application class with command-line arguments.
     *
     * @param arguments
     * @throws Exception
     */
    public static void main(String[] arguments) throws Exception {
        new DirectoryApplication().run(arguments)
    }
}
