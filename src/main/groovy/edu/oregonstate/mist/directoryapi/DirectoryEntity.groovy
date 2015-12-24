package edu.oregonstate.mist.directoryapi

/**
 * Directory entity representation class.
 */
class DirectoryEntity {
    String firstName
    String lastName
    String fullName
    String primaryAffiliation
    String jobTitle
    String department
    String departmentMailingAddress
    String homePhoneNumber
    String homeAddress
    String officePhoneNumber
    String officeAddress
    String faxNumber
    String emailAddress
    String username
    Long osuuid

    @Override
    public boolean equals(Object that) {
        if (that instanceof DirectoryEntity) {
            return (this.osuuid == that.osuuid)
        } else {
            return false
        }
    }
}
