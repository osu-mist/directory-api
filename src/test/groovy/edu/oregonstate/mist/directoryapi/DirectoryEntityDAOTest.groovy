package edu.oregonstate.mist.directoryapi

import org.junit.Test
import static org.junit.Assert.*

class DirectoryEntityDAOTest {
    private static final Long goodOSUUID = 51646559347
    private static final Long badOSUUID = 0

    @Test
    public void testGetByOSUUID() {
        assertNotNull(new DirectoryEntityDAO().getByOSUUID(goodOSUUID))
        assertNull(new DirectoryEntityDAO().getByOSUUID(badOSUUID))
    }
}
