package edu.oregonstate.mist.directoryapi

import org.ldaptive.DefaultConnectionFactory
import org.ldaptive.Connection
import org.ldaptive.LdapEntry
import org.ldaptive.LdapException
import org.ldaptive.Response
import org.ldaptive.SearchOperation
import org.ldaptive.SearchRequest
import org.ldaptive.SearchResult
import java.util.regex.Pattern

/**
 * Directory entity data access object.
 */
class DirectoryEntityDAO {
    private final String LDAP_URL
    private final String BASE_DN
    private static final Pattern illegalCharacterPattern = Pattern.compile(
            '''(?x)       # this extended regex defines
               (?!        # any character that is not
                  [
                   a-zA-Z # a letter,
                   0-9    # a number,
                   -      # a hyphen,
                   _      # an underscore,
                   \\.    # a period, or
                   @      # an at sign
                  ])
               .          # to be an illegal character.
            ''')

    /**
     * Constructs the directory entity data access object with given LDAP configuration.
     *
     * @param ldapConfiguration
     */
    public DirectoryEntityDAO(Map<String,String> ldapConfiguration) {
        LDAP_URL = ldapConfiguration.get('url')
        BASE_DN = ldapConfiguration.get('base')
    }

    /**
     * Returns list of directory entities matching search query.
     *
     * @param searchQuery
     * @return list of directory entities
     * @throws LdapException
     */
    public List<DirectoryEntity> getBySearchQuery(String searchQuery)
            throws LdapException {
        String filter = '(|'
        for (String searchTerm : split(sanitize(searchQuery))) {
            if (searchTerm) {
                filter += '(cn=*' + searchTerm + '*)' +
                        '(uid=*' + searchTerm + '*)' +
                        '(mail=*' + searchTerm + '*)'
            }
        }
        filter += ')'
        searchLDAP(filter)
    }

    /**
     * Returns directory entity matching input id.
     *
     * @param osuuid
     * @return directory entity
     * @throws LdapException
     */
    public DirectoryEntity getByOSUUID(Long osuuid)
            throws LdapException {
        String filter = '(osuuid=' + osuuid + ')'
        List<DirectoryEntity> result = searchLDAP(filter)
        if (result) {
            return result.get(0)
        } else {
            return null
        }
    }

    /**
     * Sanitizes the search query string by replacing illegal characters with spaces.
     *
     * @param searchQuery
     * @return sanitized search query
     */
    private static String sanitize(String searchQuery) {
        illegalCharacterPattern.matcher(searchQuery).replaceAll(' ')
    }

    /**
     * Splits the search query string delimited by spaces.
     *
     * @param string
     * @return
     */
    private static String[] split(String string) {
        string.split(' +')
    }

    /**
     * Searches LDAP directory for filter string.
     *
     * @param filter
     * @return directoryEntityList
     */
    private List<DirectoryEntity> searchLDAP(String filter)
            throws LdapException {
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
            // TODO: read parameters from config file
            connection.close()
        }
        directoryEntityList
    }

    /**
     * Converts LDAP entry to directory entity.
     *
     * @param ldapEntry
     * @return directoryEntity
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

    /**
     * Gets the named attribute of LDAP entry.
     *
     * @param ldapEntry
     * @param name
     * @return attribute value
     */
    private static String get(LdapEntry ldapEntry, String name) {
        ldapEntry.getAttribute(name)?.getStringValue()
    }

    /**
     * Expands affiliation abbreviation.
     *
     * @param abbreviation
     * @return affiliation
     */
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
