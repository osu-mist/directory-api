# Directory API

OSU Directory Web API.

### Generate Keys

HTTPS is required for Web APIs in development and production. Use `keytool(1)` to generate public and private keys.

Generate key pair and keystore:

    $ keytool \
        -genkey \
        -dname "CN=Jane Doe, OU=Enterprise Computing Services, O=Oregon State University, L=Corvallis, S=Oregon, C=US" \
        -alias "doej" \
        -keyalg "RSA" \
        -keysize 2048 \
        -validity 365 \
        -keystore doej.keystore

Create self-signed certificate:

    $ keytool \
        -selfcert \
        -alias "doej" \
        -sigalg "SHA256withRSA" \
        -keystore doej.keystore

Export certificate to file:

    $ keytool \
        -export \
        -alias "doej" \
        -keystore doej.keystore \
        -file doej.cer

Import certificate into truststore:

    $ keytool \
        -import \
        -alias "doej" \
        -file doej.cer \
        -keystore doej.truststore

## Gradle

This project uses the build automation tool Gradle. Use the [Gradle Wrapper](https://docs.gradle.org/current/userguide/gradle_wrapper.html) to download and install it automatically:

    $ ./gradlew

The Gradle wrapper installs Gradle in the directory `~/.gradle`. To add it to your `$PATH`, add the following line to `~/.bashrc`:

    $ export PATH=$PATH:/home/user/.gradle/wrapper/dists/gradle-2.4-all/WRAPPER_GENERATED_HASH/gradle-2.4/bin

The changes will take effect once you restart the terminal or `source ~/.bashrc`.

## Tasks

List all tasks runnable from root project:

    $ gradle tasks

### IntelliJ IDEA

Generate IntelliJ IDEA project:

    $ gradle idea

Open with `File` -> `Open Project`.

### Configure

Copy [configuration-example.yaml](configuration-example.yaml) to `configuration.yaml`. Modify as necessary, being careful to avoid committing sensitive data.

### Build

Build the project:

    $ gradle build

JARs [will be saved](https://github.com/johnrengelman/shadow#using-the-default-plugin-task) into the directory `build/libs/`.

### Run

Run the project:

    $ gradle run


## Incorporate Updates from the Skeleton

Ensure that branch `skeleton-master` is tracking remote `skeleton`:

    $ git branch -u skeleton/master skeleton-master

Update local branch:

    $ git fetch skeleton
    $ git pull

Merge the updates into your codebase as before. Note that changes to CodeNarc configuration may introduce build failures.


## Resources

The Web API definition is contained in the [Swagger specification](swagger.yaml).

The following examples demonstrate the use of `curl` to make authenticated HTTPS requests.

### GET /api/v1/

This resource returns build and runtime information:

    $ curl \
      --insecure \
      --user "username:password" \
      'https://localhost:8080/api/v1/'
    {"name":"directory-api","time":1451339045330,"commit":"eb7164a","documentation":"swagger.yaml"}

### GET /api/v1/directory/{osuuid}

This resource returns an object representing the directory entity matching the osuuid:

    $ curl \
      --insecure \
      --user "username:password" \
      'https://localhost:8080/api/v1/directory/51646559347'
    {"firstName":"Taylor","lastName":"Brown","fullName":"Brown, Taylor Alexander","primaryAffiliation":"Student","jobTitle":null,"department":"Computer Science","departmentMailingAddress":null,"homePhoneNumber":null,"homeAddress":null,"officePhoneNumber":null,"officeAddress":null,"faxNumber":null,"emailAddress":"browtayl@oregonstate.edu","username":"browtayl","osuuid":51646559347}

An error is returned if no directory entities match:

    $ curl \
      --insecure \
      --user "username:password" \
      'https://localhost:8080/api/v1/directory/1234567890'
    {"status":404,"developerMessage":"Not Found","userMessage":"Not Found","code":1404,"details":"http://example.com/errors/1404"}

### GET /api/v1/directory/?q={searchQuery}

This resource returns an array of objects representing the directory entities matching the search query:

    $ curl \
      --insecure \
      --user "username:password" \
      'https://localhost:8080/api/v1/directory/?q=leebran%20browtayl'
    [{"firstName":"Brandon","lastName":"Lee","fullName":"Lee, Brandon James","primaryAffiliation":"Student","jobTitle":null,"department":"Education","departmentMailingAddress":null,"homePhoneNumber":null,"homeAddress":null,"officePhoneNumber":null,"officeAddress":null,"faxNumber":null,"emailAddress":"leebrand@oregonstate.edu","username":"leebrand","osuuid":78313277887},{"firstName":"Taylor","lastName":"Brown","fullName":"Brown, Taylor Alexander","primaryAffiliation":"Student","jobTitle":null,"department":"Computer Science","departmentMailingAddress":null,"homePhoneNumber":null,"homeAddress":null,"officePhoneNumber":null,"officeAddress":null,"faxNumber":null,"emailAddress":"browtayl@oregonstate.edu","username":"browtayl","osuuid":51646559347},{"firstName":"Brandon","lastName":"Lee","fullName":"Lee, Brandon Michael","primaryAffiliation":"Student","jobTitle":null,"department":"Computer Science","departmentMailingAddress":null,"homePhoneNumber":null,"homeAddress":null,"officePhoneNumber":null,"officeAddress":null,"faxNumber":null,"emailAddress":"leebran@oregonstate.edu","username":"leebran","osuuid":64979932965}]

Search terms match names, email addresses, and usernames. An empty array is returned if no directory entities match:

    $ curl \
      --insecure \
      --user "username:password" \
      'https://localhost:8080/api/v1/directory/?q=foobar'
    []

An error is returned if the request is invalid:

    $ curl \
      --insecure \
      --user "username:password" \
      'https://localhost:8080/api/v1/directory/?q='
    {"status":400,"developerMessage":"Missing query parameter.","userMessage":"Bad Request","code":1400,"details":"http://example.com/errors/1400"}
