package edu.oregonstate.mist.directoryapi

import edu.oregonstate.mist.api.Resource
import edu.oregonstate.mist.api.AuthenticatedUser
import io.dropwizard.auth.Auth
import io.dropwizard.jersey.params.IntParam

import javax.print.attribute.standard.Media
import javax.ws.rs.GET
import javax.ws.rs.POST
import javax.ws.rs.Path
import javax.ws.rs.PathParam
import javax.ws.rs.Produces
import javax.ws.rs.Consumes
import javax.ws.rs.core.Context
import javax.ws.rs.core.Response
import javax.ws.rs.core.Response.ResponseBuilder
import javax.ws.rs.core.MediaType
import javax.ws.rs.core.UriInfo

/**
 * DirectoryEntity Resource class.
 */
@Path('/directory')
class DirectoryEntityResource extends Resource {

    private final DirectoryEntityDAO directoryEntityDAO

    @Context
    UriInfo uriInfo

    /**
     * Constructs the object after receiving and storing directoryEntityDAO instance.
     */
    public DirectoryEntityResource(DirectoryEntityDAO directoryEntityDAO) {
        this.directoryEntityDAO = directoryEntityDAO
    }

    @GET
    @Path('/')
    @Produces(MediaType.APPLICATION_JSON)
    public List<DirectoryEntity> getAll() {
        directoryEntityDAO.allDirectoryEntities
    }

    @GET
    @Path('/{osuuid}')
    @Produces(MediaType.APPLICATION_JSON)
    public Response getByOsuuid(@PathParam('osuuid') IntParam osuuid) {
        DirectoryEntity directoryEntities = directoryEntityDAO.getByosuuid(osuuid.get())

        Response returnResponse

        if (directoryEntities == null) {
            edu.oregonstate.mist.api.Error returnError = new edu.oregonstate.mist.api.Error(userMessage: "Resource Not Found.", code: Response.Status.NOT_FOUND.getStatusCode())
            returnResponse = Response.status(Response.Status.NOT_FOUND).entity(returnError).build()
        } else {
            returnResponse = Response.ok(directoryEntities).build()
        }

        returnResponse
    }
}
