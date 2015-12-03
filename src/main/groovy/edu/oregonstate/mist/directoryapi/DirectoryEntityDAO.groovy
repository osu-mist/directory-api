package edu.oregonstate.mist.directoryapi

import org.ldaptive.DefaultConnectionFactory
import org.ldaptive.Connection
import org.ldaptive.LdapEntry
import org.ldaptive.Response
import org.ldaptive.SearchOperation
import org.ldaptive.SearchRequest
import org.ldaptive.SearchResult

/**
 * Directory entity data access object.
 */
class DirectoryEntityDAO {
    // FIXME: define properties in external file?
    private final String LDAP_URL = 'ldap://client-ldap.onid.orst.edu'
    private final String BASE_DN = 'ou=People, o=orst.edu'

    /**
     * Returns all directory entities matching map of input parameters.
     * <br>
     * Possible parameters:
     * <ul>
     *     <li>String firstName</li>
     *     <li>String lastName</li>
     *     <li>String fullName</li>
     *     <li>String primaryAffiliation</li>
     *     <li>String jobTitle</li>
     *     <li>String department</li>
     *     <li>String departmentMailingAddress</li>
     *     <li>String homePhoneNumber</li>
     *     <li>String homeAddress</li>
     *     <li>String officePhoneNumber</li>
     *     <li>String officeAddress</li>
     *     <li>String faxNumber</li>
     *     <li>String emailAddress</li>
     *     <li>String username</li>
     * </ul>
     */
    public List<DirectoryEntity> getByParameters(Map parameters) {
        // TODO: convert parameters into filter string
        // TODO: return search results
    }

    /**
     * Returns directory entity matching input id.
     */
    public DirectoryEntity getByOSUUID(Integer osuuid) {
        // TODO: convert parameter into filter string
        // TODO: return search result
    }

    /**
     * Searches LDAP directory for filter string.
     *
     * @param filter
     * @return directoryEntityList
     */
    private List<DirectoryEntity> searchLDAP(String filter) {
        List<DirectoryEntity> directoryEntityList = new ArrayList<DirectoryEntity>()
        Connection connection = DefaultConnectionFactory.getConnection(LDAP_URL)
        try {
            connection.open()
            SearchOperation operation = new SearchOperation(connection)
            SearchRequest request = new SearchRequest(BASE_DN, filter)
            Response<SearchResult> response = operation.execute(request)
            SearchResult result = response.getResult()
            for (LdapEntry entry : result.getEntries()) {
                directoryEntityList.add(convert(entry))
            }
        } finally{
            connection.close()
        }
        directoryEntityList
    }

    /**
     * Converts LdapEntry to DirectoryEntity.
     *
     * @param ldapEntry
     * @return DirectoryEntity
     */
    private DirectoryEntity convert(LdapEntry ldapEntry) {
        // TODO: convert LdapEntry to DirectoryEntity
    }
}
