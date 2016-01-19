package edu.oregonstate.mist.directoryapi

import edu.oregonstate.mist.api.Configuration
import com.fasterxml.jackson.annotation.JsonProperty
import javax.validation.Valid
import javax.validation.constraints.NotNull

/**
 *  An object representation of the YAML configuration file.
 */
class DirectoryApplicationConfiguration extends Configuration {
    @JsonProperty('ldap')
    @NotNull
    @Valid
    Map<String,Object> ldapConfiguration
}
