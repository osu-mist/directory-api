package edu.oregonstate.mist.directoryapi

import groovy.transform.EqualsAndHashCode

/**
 * Directory entity representation class.
 */
@EqualsAndHashCode
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
    String alternatePhoneNumber
    Long osuuid
}
