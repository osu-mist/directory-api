package edu.oregonstate.mist.directoryapi

import io.dropwizard.testing.junit.DropwizardAppRule
import io.dropwizard.testing.ResourceHelpers
import org.junit.Test
import org.junit.ClassRule
import org.junit.BeforeClass
import static org.junit.Assert.*

class DirectoryEntityDAOTest {
    private static DirectoryEntityDAO directoryEntityDAO
    private static final Long goodOSUUID = 51646559347
    private static final Long badOSUUID = 0
    private static final String goodUID = 'browtayl'
    private static final String badUID = 'abcdef'
    private static final String goodUnicodeUID = 'jimenjos'

    @ClassRule
    public static final DropwizardAppRule<DirectoryApplicationConfiguration> APPLICATION =
            new DropwizardAppRule<DirectoryApplicationConfiguration>(
                    DirectoryApplication.class,
                    ResourceHelpers.resourceFilePath('configuration.yaml')) // FIXME: src/main/resources

    @BeforeClass
    public static void setUpClass() {
        directoryEntityDAO = new DirectoryEntityDAO(APPLICATION.configuration.getLdapConfiguration())
    }

    @Test
    public void testGetByOSUUID() {
        assertNotNull(directoryEntityDAO.getByOSUUID(goodOSUUID))
        assertNull(directoryEntityDAO.getByOSUUID(badOSUUID))
    }

    @Test
    public void testGetBySearchQuery() {
        assertTrue(directoryEntityDAO.getBySearchQuery(badUID).isEmpty())
        assertFalse(directoryEntityDAO.getBySearchQuery(goodUID).isEmpty())
    }

    @Test
    public void testGetBySearchQuerySplit() {
        assertFalse(directoryEntityDAO.getBySearchQuery(goodUID + ' ' + badUID).isEmpty())
        assertFalse(directoryEntityDAO.getBySearchQuery(badUID + ' ' + goodUID).isEmpty())
    }

    @Test
    public void testGetBySearchQuerySanitize() {
        List<DirectoryEntity> expected = directoryEntityDAO.getBySearchQuery(goodUID)
        assertEquals(expected, directoryEntityDAO.getBySearchQuery(goodUID + '('))
        assertEquals(expected, directoryEntityDAO.getBySearchQuery(goodUID + ')'))
        assertEquals(expected, directoryEntityDAO.getBySearchQuery(goodUID + '*'))
        assertEquals(expected, directoryEntityDAO.getBySearchQuery(goodUID + '&'))
        assertEquals(expected, directoryEntityDAO.getBySearchQuery(goodUID + '#'))
        assertEquals(expected, directoryEntityDAO.getBySearchQuery('#' + goodUID))
    }

    @Test
    public void testGetBySearchQuerySanitizeUnicode() {
        List<DirectoryEntity> expected = directoryEntityDAO.getBySearchQuery(goodUnicodeUID)
        assertEquals(expected, directoryEntityDAO.getBySearchQuery('jiménez'))
    }
}
