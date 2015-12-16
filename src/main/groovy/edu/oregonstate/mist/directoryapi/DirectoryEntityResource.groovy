package edu.oregonstate.mist.directoryapi

import edu.oregonstate.mist.api.Resource
import edu.oregonstate.mist.api.AuthenticatedUser
import io.dropwizard.auth.Auth
import javax.ws.rs.GET
import javax.ws.rs.Path
import javax.ws.rs.PathParam
import javax.ws.rs.Produces
import javax.ws.rs.QueryParam
import javax.ws.rs.core.Response
import javax.ws.rs.core.Response.ResponseBuilder
import javax.ws.rs.core.MediaType

/**
 * DirectoryEntity Resource class.
 */
@Path('/directory')
class DirectoryEntityResource extends Resource {
    private final DirectoryEntityDAO directoryEntityDAO

    /**
     * Constructs the object after receiving and storing directoryEntityDAO instance.
     */
    public DirectoryEntityResource(DirectoryEntityDAO directoryEntityDAO) {
        this.directoryEntityDAO = directoryEntityDAO
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getByParameters(
            @Auth AuthenticatedUser authenticatedUser,
            @QueryParam('firstName') String firstName,
            @QueryParam('lastName') String lastName,
            @QueryParam('fullName') String fullName,
            @QueryParam('primaryAffiliation') String primaryAffiliation,
            @QueryParam('jobTitle') String jobTitle,
            @QueryParam('department') String department,
            @QueryParam('departmentMailingAddress') String departmentMailingAddress,
            @QueryParam('homePhoneNumber') String homePhoneNumber,
            @QueryParam('homeAddress') String homeAddress,
            @QueryParam('officePhoneNumber') String officePhoneNumber,
            @QueryParam('officeAddress') String officeAddress,
            @QueryParam('faxNumber') String faxNumber,
            @QueryParam('emailAddress') String emailAddress,
            @QueryParam('username') String username) {
        ResponseBuilder responseBuilder
        List<DirectoryEntity> directoryEntityList = directoryEntityDAO.getByParameters( // TODO: security?
                givenname: firstName,
                sn: lastName,
                cn: fullName,
                osuprimaryaffiliation: primaryAffiliation,
                title: jobTitle,
                osudepartment: department,
                postaladdress: departmentMailingAddress,
                homephone: homePhoneNumber,
                homepostaladdress: homeAddress,
                telephonenumber: officePhoneNumber,
                osuofficeaddress: officeAddress,
                facsimiletelephonenumber: faxNumber,
                mail: emailAddress,
                uid: username)
        if (directoryEntityList != null
                && !directoryEntityList.isEmpty()) {
            responseBuilder = ok(directoryEntityList)
        } else {
            responseBuilder = notFound()
        }
        responseBuilder.build()
    }

    @GET
    @Path('/{osuuid}')
    @Produces(MediaType.APPLICATION_JSON)
    public Response getByOSUUID(
            @Auth AuthenticatedUser authenticatedUser,
            @PathParam('osuuid') Long osuuid) {
        ResponseBuilder responseBuilder
        DirectoryEntity directoryEntity = directoryEntityDAO.getByOSUUID(osuuid)
        if (directoryEntity != null) {
            responseBuilder = ok(directoryEntity)
        } else {
            responseBuilder = notFound()
        }
        responseBuilder.build()
    }
}
