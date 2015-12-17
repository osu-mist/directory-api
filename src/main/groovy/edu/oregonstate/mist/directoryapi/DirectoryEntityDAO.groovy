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
    private final String LDAP_URL
    private final String BASE_DN

    public DirectoryEntityDAO(Map<String,String> ldapConfiguration) {
        LDAP_URL = ldapConfiguration.get('url')
        BASE_DN = ldapConfiguration.get('base')
    }

    /**
     * Returns all directory entities matching map of input parameters.
     */
    public List<DirectoryEntity> getByParameters(Map parameters) {
        List<DirectoryEntity> result = searchLDAP(filter(parameters))
        if (!result.isEmpty()) {
            return result
        } else {
            return null
        }
    }

    /**
     * Returns directory entity matching input id.
     */
    public DirectoryEntity getByOSUUID(Long osuuid) {
        List<DirectoryEntity> result = searchLDAP(filter(osuuid: osuuid))
        if (!result.isEmpty()) {
            return result.get(0)
        } else {
            return null
        }
    }

    private static String filter(Map parameters) {
        String filter = '(&'
        for (Map.Entry<String,String> parameter : parameters.entrySet()) {
            if (parameter.value != null) {
                filter += '(' + parameter.key + '=' + parameter.value + ')'
            }
        }
        filter += ')'
        filter
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
        } finally {
            // TODO: http://www.ldaptive.org/docs/guide/connections/pooling.html
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
    private static DirectoryEntity convert(LdapEntry ldapEntry) {
        new DirectoryEntity(
                firstName:                get(ldapEntry, 'givenname'),
                lastName:                 get(ldapEntry, 'sn'),
                fullName:                 get(ldapEntry, 'cn'),
                primaryAffiliation:       affiliation(get(ldapEntry, 'osuprimaryaffiliation')),
                jobTitle:                 get(ldapEntry, 'title'),
                department:               get(ldapEntry, 'osudepartment'),
                departmentMailingAddress: get(ldapEntry, 'postaladdress'),
                homePhoneNumber:          get(ldapEntry, 'homephone'),
                homeAddress:              get(ldapEntry, 'homepostaladdress'),
                officePhoneNumber:        get(ldapEntry, 'telephonenumber'),
                officeAddress:            get(ldapEntry, 'osuofficeaddress'),
                faxNumber:                get(ldapEntry, 'facsimiletelephonenumber'),
                emailAddress:             get(ldapEntry, 'mail'),
                username:                 get(ldapEntry, 'uid'),
                osuuid:                   Long.parseLong(get(ldapEntry, 'osuuid'))
        )
    }

    private static String get(LdapEntry ldapEntry, String name) {
        ldapEntry.getAttribute(name)?.getStringValue()
    }

    private static String affiliation(String abbreviation) {
        switch (abbreviation) {
            case 'E':
                return 'Employee'
            case 'S':
                return 'Student'
            case 'O':
                return 'Other'
            case 'U':
            default:
                return 'Unknown'
        }
    }
}
