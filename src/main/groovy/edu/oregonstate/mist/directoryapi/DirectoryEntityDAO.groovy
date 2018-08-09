package edu.oregonstate.mist.directoryapi

import org.ldaptive.Connection
import org.ldaptive.LdapEntry
import org.ldaptive.LdapException
import org.ldaptive.Response
import org.ldaptive.ResultCode
import org.ldaptive.SearchOperation
import org.ldaptive.SearchRequest
import org.ldaptive.SearchResult
import org.ldaptive.pool.PooledConnectionFactory
import java.util.regex.Pattern

/**
 * Directory entity data access object.
 */
class DirectoryEntityDAO {
    private final String BASE_DN
    private final PooledConnectionFactory pooledConnectionFactory
    private static final Pattern illegalCharacterPattern = Pattern.compile(
            '''(?x)             # this extended regex defines
               (?!              # any character that is not
                  [
                   \\p{IsLatin} # a unicode letter,
                   0-9          # a number,
                   -            # a hyphen,
                   _            # an underscore,
                   \\.          # a period, or
                   @            # an at sign
                  ])
               .                # to be an illegal character.
            ''')
    private static final Pattern spacesPattern = Pattern.compile(' +')
    private static final Pattern dollarSignPattern = Pattern.compile('\\$')

    // Map affiliation abbreviation from ldap to plain english name
    private static final HashMap<String, String> affiliations = [
            E: 'Employee',
            O: 'Other',
            R: 'Retiree',
            S: 'Student',
            U: 'Unknown',
    ]

    // Map API consumer-interacted-fields to ldap equivalents
    private static HashMap<String, String> ldapFields = [
            firstName: 'givenname',
            lastName: 'sn',
            fullName: 'cn',
            primaryAffiliation: 'osuprimaryaffiliation',
            jobTitle: 'title',
            department: 'osudepartment',
            departmentMailingAddress: 'postaladdress',
            homePhoneNumber: 'homephone',
            homeAddress: 'homepostaladdress',
            officePhoneNumber: 'telephonenumber',
            officeAddress: 'osuofficeaddress',
            faxNumber: 'facsimiletelephonenumber',
            emailAddress: 'mail',
            username: 'uid',
            alternatePhoneNumber: 'osuAltPhoneNumber',
            osuuid: 'osuuid'
    ]

    /**
     * Constructs the directory entity data access object with given LDAP configuration.
     *
     * @param ldapConfiguration
     */
    public DirectoryEntityDAO(Map<String,Object> ldapConfiguration,
                              PooledConnectionFactory ldapConnectionPool) {

        BASE_DN = (String)ldapConfiguration.get('base')
        pooledConnectionFactory = ldapConnectionPool
    }

    /**
     * Returns list of directory entities matching search query.
     *
     * @param searchQuery
     * @return list of directory entities
     * @throws LdapException
     */
    public List<DirectoryEntity> getBySearchQuery(
            Map<String, String> searchParameters) throws LdapException {
        String filter = '(&(objectclass=person)'

        if (searchParameters['searchQuery']) {
            for (String searchTerm : split(sanitize(searchParameters['searchQuery']))) {
                if (searchTerm) {
                    filter += "(|(${ldapFields['firstName']}=$searchTerm*)" +
                            "(${ldapFields['lastName']}=$searchTerm*)" +
                            "(${ldapFields['username']}=$searchTerm)" +
                            "(${ldapFields['emailAddress']}=$searchTerm*))"
                }
            }
        }
        if (searchParameters['primaryAffiliation']) {
            filter += "(${ldapFields['primaryAffiliation']}=" +
                    "${affiliationAbbreviation(searchParameters['primaryAffiliation'])})"
        }
        if (searchParameters['lastName']) {
            filter += "(${ldapFields['lastName']}=${searchParameters['lastName']}*)"
        }
        if (searchParameters['emailAddress']) {
            // Should this really be a wild card search?
            filter += "(${ldapFields['emailAddress']}=${searchParameters['emailAddress']}*)"
        }
        if (searchParameters['officePhoneNumber']) {
            filter += "(${ldapFields['officePhoneNumber']}=" +
                    "*${searchParameters['officePhoneNumber']}*)"
        }
        if (searchParameters['alternatePhoneNumber']) {
            filter += "(${ldapFields['alternatePhoneNumber']}=" +
                    "*${searchParameters['alternatePhoneNumber']}*)"
        }
        if (searchParameters['homePhoneNumber']) {
            filter += "(${ldapFields['homePhoneNumber']}=*${searchParameters['homePhoneNumber']}*)"
        }
        if (searchParameters['phoneNumber']) {
            filter += "(|" +
                    "(${ldapFields['officePhoneNumber']}=*${searchParameters['phoneNumber']}*)" +
                    "(${ldapFields['alternatePhoneNumber']}=*${searchParameters['phoneNumber']}*)" +
                    "(${ldapFields['homePhoneNumber']}=*${searchParameters['phoneNumber']}*))"
        }
        if (searchParameters['faxNumber']) {
            filter += "(${ldapFields['faxNumber']}=*${searchParameters['faxNumber']}*)"
        }
        if (searchParameters['officeAddress']) {
            filter += "(${ldapFields['officeAddress']}=*${searchParameters['officeAddress']}*)"
        }
        if (searchParameters['department']) {
            filter += "(${ldapFields['department']}=*${searchParameters['department']}*)"
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
        String filter = "(${ldapFields['osuuid']}=$osuuid)"
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
        spacesPattern.split(string)
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
        Connection connection = pooledConnectionFactory.getConnection()
        try {
            SearchOperation operation = new SearchOperation(connection)
            SearchRequest request = new SearchRequest(BASE_DN, filter)
            Response<SearchResult> response = operation.execute(request)
            if (response.getResultCode() == ResultCode.SIZE_LIMIT_EXCEEDED) {
                throw new LdapException('Size limit exceeded.', ResultCode.SIZE_LIMIT_EXCEEDED)
            } else {
                SearchResult result = response.getResult()
                for (LdapEntry entry : result.getEntries()) {
                    directoryEntityList.add(convert(entry))
                }
            }
        } finally {
            connection.close() // return connection to pool
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
                firstName:                get(ldapEntry, ldapFields['firstName']),
                lastName:                 get(ldapEntry, ldapFields['lastName']),
                fullName:                 get(ldapEntry, ldapFields['fullName']),
                primaryAffiliation:       getAffiliation(ldapEntry),
                jobTitle:                 get(ldapEntry, ldapFields['jobTitle']),
                department:               get(ldapEntry, ldapFields['department']),
                departmentMailingAddress: address(get(ldapEntry,
                        ldapFields['departmentMailingAddress'])),
                homePhoneNumber:          get(ldapEntry, ldapFields['homePhoneNumber']),
                homeAddress:              address(get(ldapEntry, ldapFields['homeAddress'])),
                officePhoneNumber:        get(ldapEntry, ldapFields['officePhoneNumber']),
                officeAddress:            address(get(ldapEntry, ldapFields['officeAddress'])),
                faxNumber:                get(ldapEntry, ldapFields['faxNumber']),
                emailAddress:             get(ldapEntry, ldapFields['emailAddress']),
                username:                 get(ldapEntry, ldapFields['username']),
                alternatePhoneNumber:     get(ldapEntry, ldapFields['alternatePhoneNumber']),
                osuuid:                   getOSUUid(ldapEntry)
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
     * Gets an osuuid as a long
     *
     * @param ldapEntry
     * @return Long osuuid
     */
    private static Long getOSUUid(LdapEntry ldapEntry) {
        String osuuidString = get(ldapEntry, ldapFields['osuuid'])
        Long osuuid = 0

        if (osuuidString && osuuidString.matches("[0-9]+")) {
            osuuid = Long.parseLong(osuuidString)
        }

        osuuid
    }

    /**
     * Return english affiliation name from abbreviation in LdapEntry.
     * @param ldapEntry
     * @return
     */
    private static String getAffiliation(LdapEntry ldapEntry) {
        String affiliationAbbreviation = get(ldapEntry, ldapFields['primaryAffiliation'])

        affiliations[affiliationAbbreviation]
    }

    /**
     * Derive affiliation abbreviation from english affiliation name.
     *
     * @param affiliation
     * @return abbreviation
     */
    private static String affiliationAbbreviation(String affiliation) {
        affiliations.find { it.value == affiliation }?.key
    }

    /**
     * Formats mailing address.
     *
     * @param address
     * @return formatted address
     */
    private static String address(String address) {
        if (address) {
            dollarSignPattern.matcher(address).replaceAll('\n')
        }
    }
}