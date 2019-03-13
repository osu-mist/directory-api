package edu.oregonstate.mist.directoryapi

import org.junit.Test

class DirectoryEntityDAOTest {
    private final goodUID = "browtayl"

    @Test
    public void testSanitize() {
        assert DirectoryEntityDAO.sanitize(goodUID + "(").trim() == goodUID
        assert DirectoryEntityDAO.sanitize(goodUID + ")").trim() == goodUID
        assert DirectoryEntityDAO.sanitize(goodUID + "*").trim() == goodUID
        assert DirectoryEntityDAO.sanitize(goodUID + "&").trim() == goodUID
        assert DirectoryEntityDAO.sanitize(goodUID + "#").trim() == goodUID
        assert DirectoryEntityDAO.sanitize("#" + goodUID).trim() == goodUID
        assert DirectoryEntityDAO.sanitize("José") == "José"
        assert DirectoryEntityDAO.sanitize("Hernández") == "Hernández"
    }
}
