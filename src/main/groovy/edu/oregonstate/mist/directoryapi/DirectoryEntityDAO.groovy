package edu.oregonstate.mist.directoryapi

/**
 * Directory entity data access object.
 */
class DirectoryEntityDAO {
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
    }

    /**
     * Returns directory entity matching input id.
     */
    public DirectoryEntity getByOSUUID(Integer osuuid) {
    }
}
