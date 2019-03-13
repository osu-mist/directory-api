package edu.oregonstate.mist.directoryapi

import edu.oregonstate.mist.api.Application
import io.dropwizard.setup.Environment
import org.ldaptive.DefaultConnectionFactory
import org.ldaptive.pool.PoolConfig
import org.ldaptive.pool.PooledConnectionFactory
import org.ldaptive.pool.SoftLimitConnectionPool

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

        PooledConnectionFactory ldapConnectionPool = configureLdapPool(
                configuration.ldapConfiguration)

        final DirectoryEntityDAO DIRECTORYENTITYDAO = new DirectoryEntityDAO(
                configuration.ldapConfiguration,
                ldapConnectionPool
        )

        def endpointUri = configuration.api.endpointUri
        environment.healthChecks().register('LDAP', new LDAPHealthCheck(DIRECTORYENTITYDAO))
        environment.jersey().register(new DirectoryEntityResource(DIRECTORYENTITYDAO, endpointUri))
    }

    private static PooledConnectionFactory configureLdapPool(Map<String,Object> ldapConfiguration) {
        def ldapURL = (String)ldapConfiguration.get('url')
        DefaultConnectionFactory defaultConnectionFactory = new DefaultConnectionFactory(ldapURL)

        PoolConfig poolConfig = new PoolConfig(
                maxPoolSize: (int)ldapConfiguration.get('maxPoolSize'),
                minPoolSize: (int)ldapConfiguration.get('minPoolSize'),
                validateOnCheckIn: (boolean)ldapConfiguration.get('validateOnCheckIn'),
                validateOnCheckOut: (boolean)ldapConfiguration.get('validateOnCheckOut'),
                validatePeriod: (long)ldapConfiguration.get('validatePeriod'),
                validatePeriodically: (boolean)ldapConfiguration.get('validatePeriodically')
        )
        SoftLimitConnectionPool pool = new SoftLimitConnectionPool(
                poolConfig, defaultConnectionFactory
        )

        pool.initialize()
        new PooledConnectionFactory(pool)
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
