package edu.oregonstate.mist.directoryapi

import edu.oregonstate.mist.api.Error
import org.junit.Before
import org.junit.Test

import javax.ws.rs.core.Response

import static org.junit.Assert.assertEquals
import static org.mockito.Mockito.*

class DirectoryEntityResourceTest {

    private final URI endpointUri = new URI("https://www.foo.com/")

    private static String goodSearchQuery = "john doe"
    private static String badSearchQuery = "mr. null"
    private static Long goodOSUUID = 12345678
    private static Long badOSUUID = 1010101

    private static DirectoryEntity directoryEntity = new DirectoryEntity(
            firstName: "John", lastName: "Doe", fullName: "Doe, John",
            primaryAffiliation: "Employee", jobTitle: "Analyst Programmer",
            department: "Data Architecture Team", departmentMailingAddress: "101 OSU Street",
            homePhoneNumber: "555 555 5555", homeAddress: "1001 Main Street",
            officePhoneNumber: "555 123 4567", officeAddress: "3000 College Drive",
            faxNumber: "555 990 5555", emailAddress: "doej@university.foo", username: "doej",
            alternatePhoneNumber: "555 555 5551", osuuid: goodOSUUID
    )

    private DirectoryEntityDAO mockDAO = mock(DirectoryEntityDAO.class)
    private DirectoryEntityResource directoryEntityResource

    @Before
    void setupMockDAO() {
        when(mockDAO.getBySearchQuery([searchQuery: goodSearchQuery])).thenReturn([directoryEntity])
        when(mockDAO.getByOSUUID(goodOSUUID)).thenReturn(directoryEntity)

        when(mockDAO.getBySearchQuery([searchQuery: badSearchQuery])).thenReturn([])
        when(mockDAO.getByOSUUID(badOSUUID)).thenReturn(null)

        directoryEntityResource = new DirectoryEntityResource(mockDAO, endpointUri)
    }

    @Test
    void noParametersShouldReturn400() {
        DirectoryEntityResource resource = new DirectoryEntityResource(null, null)

        Response response = resource.getBySearchQuery(null, null, null, null, null, null, null,
                null, null, null, null)

        assertEquals(response.status, 400)
    }

    @Test
    void testValidQueryRequest() {
        Response response = directoryEntityResource.getBySearchQuery(goodSearchQuery, null, null,
                null, null, null, null, null, null, null, null)

        assertEquals(200, response.status)
        assertEquals(directoryEntity, response.getEntity()['data'][0]['attributes'])
    }

    @Test
    void testEmptyQueryResponse() {
        Response response = directoryEntityResource.getBySearchQuery(badSearchQuery, null, null,
                null, null, null, null, null, null, null, null)

        assertEquals(200, response.status)
        assertEquals([], response.getEntity()['data'])
    }

    @Test
    void testGoodOSUUID() {
        Response response = directoryEntityResource.getByOSUUID(goodOSUUID)

        assertEquals(200, response.status)
        assertEquals(directoryEntity, response.getEntity()['data']['attributes'])
    }

    @Test
    void testBadOSUUID() {
        Response response = directoryEntityResource.getByOSUUID(badOSUUID)

        assertEquals(404, response.status)
        assertEquals(Error.class, response.getEntity().class)
    }

}
