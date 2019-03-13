package edu.oregonstate.mist.directoryapi

import edu.oregonstate.mist.api.Resource
import javax.annotation.security.PermitAll
import org.ldaptive.LdapException
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import javax.ws.rs.GET
import javax.ws.rs.Path
import javax.ws.rs.PathParam
import javax.ws.rs.Produces
import javax.ws.rs.QueryParam
import javax.ws.rs.core.Response
import javax.ws.rs.core.Response.ResponseBuilder
import javax.ws.rs.core.MediaType
import javax.ws.rs.core.UriBuilder

/**
 * Directory entity resource class.
 */
@Path('/directory')
@PermitAll
class DirectoryEntityResource extends Resource {
    Logger logger = LoggerFactory.getLogger(DirectoryEntityResource.class)

    private final DirectoryEntityDAO directoryEntityDAO
    private final String RESOURCETYPE = "directory"

    private String endpointUri

    /**
     * Constructs the object after receiving and storing directoryEntityDAO instance.
     *
     * @param directoryEntityDAO
     */
    public DirectoryEntityResource(DirectoryEntityDAO directoryEntityDAO, URI endpointUri) {
        this.directoryEntityDAO = directoryEntityDAO
        this.setEndpointUri(endpointUri)
        this.@endpointUri = endpointUri
    }

    /**
     * Responds to GET requests by returning array of resultObjects matching search query parameter.
     *
     * @param authenticatedUser
     * @param searchQuery
     * @return resultObject object
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getBySearchQuery(@QueryParam('q') String searchQuery,
                                     @QueryParam('primaryAffiliation') String primaryAffiliation,
                                     @QueryParam('lastName') String lastName,
                                     @QueryParam('emailAddress') String emailAddress,
                                     @QueryParam('officePhoneNumber') String officePhoneNumber,
                                     @QueryParam('alternatePhoneNumber') String
                                                 alternatePhoneNumber,
                                     @QueryParam('homePhoneNumber') String homePhoneNumber,
                                     @QueryParam('phoneNumber') String phoneNumber,
                                     @QueryParam('faxNumber') String faxNumber,
                                     @QueryParam('officeAddress') String officeAddress,
                                     @QueryParam('department') String department) {
        ResponseBuilder responseBuilder

        def queryMap = [
                searchQuery: searchQuery, primaryAffiliation: primaryAffiliation,
                lastName: lastName, emailAddress: emailAddress,
                officePhoneNumber: officePhoneNumber, alternatePhoneNumber: alternatePhoneNumber,
                homePhoneNumber: homePhoneNumber, phoneNumber: phoneNumber, faxNumber: faxNumber,
                officeAddress: officeAddress, department: department
        ]

        def includedQueryParameters = queryMap.findAll { it.value }.collect { it.key }

        if (includedQueryParameters.size() == 0) {
            responseBuilder = badRequest('No search parameters provided.')
        } else {
            try {
                List<DirectoryEntity> directoryEntities = directoryEntityDAO.getBySearchQuery(
                        queryMap.subMap(includedQueryParameters)
                )

                ResultObject resultObject = new ResultObject(
                    links: null,
                    data: directoryEntities.collect {
                        new ResourceObject(
                            id: it.osuuid,
                            type: RESOURCETYPE,
                            attributes: it,
                            links: getLinks(it)
                        )
                    }
                )

                responseBuilder = ok(resultObject)
            } catch (LdapException ldapException) {
                logger.error("Ldap Exception thrown when getting by search query", ldapException)
                responseBuilder = badRequest(ldapException.message)
            }
        }
        responseBuilder.build()
    }

    /**
     * Responds to GET requests by returning resultObject object matching argument id.
     *
     * @param authenticatedUser
     * @param osuuid
     * @return resultObject object
     */
    @GET
    @Path('/{osuuid: \\d+}')
    @Produces(MediaType.APPLICATION_JSON)
    public Response getByOSUUID(@PathParam('osuuid') Long osuuid) {
        ResponseBuilder responseBuilder
        try {
            DirectoryEntity directoryEntity = directoryEntityDAO.getByOSUUID(osuuid)
            if (directoryEntity != null) {
                ResourceObject resourceObject = new ResourceObject(
                        id: osuuid,
                        type: RESOURCETYPE,
                        attributes: directoryEntity,
                        links: getLinks(directoryEntity)
                )
                ResultObject resultObject = new ResultObject(
                        links: null,
                        data: resourceObject
                )
                responseBuilder = ok(resultObject)
            } else {
                responseBuilder = notFound()
            }
        } catch (LdapException ldapException) {
            logger.error("Ldap Exception thrown when getting by OSUUID", ldapException)
            responseBuilder = internalServerError(ldapException.message)
        }
        responseBuilder.build()
    }

    /**
     * Returns the jsonapi links to be displayed within a single resource object.
     *
     * @param directoryEntity
     * @return
     */
    private LinkedHashMap<String, String> getLinks(DirectoryEntity directoryEntity) {
        UriBuilder builder = UriBuilder.fromUri(endpointUri).path(this.class).path("{id}")
        [
            'self': builder.build(directoryEntity.osuuid)
        ]
    }
}
