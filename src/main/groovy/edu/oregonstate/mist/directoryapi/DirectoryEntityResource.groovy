package edu.oregonstate.mist.directoryapi

import edu.oregonstate.mist.api.Resource
import edu.oregonstate.mist.api.AuthenticatedUser
import io.dropwizard.auth.Auth
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
    public Response getBySearchQuery(
            @Auth AuthenticatedUser authenticatedUser,
            @QueryParam('q') String searchQuery) {
        ResponseBuilder responseBuilder
        if (!searchQuery) {
            responseBuilder = badRequest('Missing query parameter.')
        } else {
            try {
                List<DirectoryEntity> directoryEntities = directoryEntityDAO.getBySearchQuery(
                        searchQuery
                )

                List<ResourceObject> resourceObjectList = new ArrayList<ResourceObject>()
                directoryEntities.each {
                    resourceObjectList.add(new ResourceObject(
                            id: it.osuuid,
                            type: RESOURCETYPE,
                            attributes: it,
                            links: getLinks(it)
                    ))
                }
                ResultObject resultObject = new ResultObject(
                        links: null,
                        data: resourceObjectList
                )
                responseBuilder = ok(resultObject)
            } catch (LdapException ldapException) {
                logger.error("Ldap Exception thrown when getting by search query", ldapException)
                responseBuilder = internalServerError(ldapException.message)
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
    public Response getByOSUUID(
            @Auth AuthenticatedUser authenticatedUser,
            @PathParam('osuuid') Long osuuid) {
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
