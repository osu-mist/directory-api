const fakeBaseUrl = 'v2';

const singleResult = {
  testCase: 'fakeId',
  expectedResult: {},
  description: 'fulfilled with a single result',
};

const multiResult = {
  testCase: { firstName: 'fakeName' },
  expectedResult: [],
  description: 'fulfilled with multiple results',
};

const noQueryParams = {
  testCase: {},
  description: 'return undefined when no query parameters are passed',
};

const people = [
  {
    id: '1111',
    firstName: 'Benny',
    lastName: 'Beaver',
    primaryAffiliation: 'Student',
  },
  {
    id: '2222',
    firstName: 'Donald',
    lastName: 'Duck',
    primaryAffiliation: 'Student',
  },
  {
    id: '3333',
    firstName: 'Sally',
    lastName: 'Seal',
    primaryAffiliation: 'Student',
  },
];

const rawDirectories = [
  {
    dn: 'osuuid=12345678910,ou=people,o=orst.edu',
    controls: [],
    osuOfficeAddress:
      'Horticulture$USDA-ARS (HCRL)$3420 NW Orchard Ave$Corvallis, OR 97330-5014',
    postalAddress:
      'Horticulture$Oregon State University$4017 Ag and Life Science Bldg$Corvallis, OR 97331-8646',
    mail: 'guy@oregonstate.edu',
    osuDepartment: 'Horticulture',
    title: 'Courtesy Appointment',
    facsimileTelephoneNumber: '1 541 867 5309',
    telephoneNumber: '1 541 867 5309',
    sn: 'Guy',
    cn: 'Guy, Just A',
    givenName: 'Just',
    objectClass: [
      'top',
      'person',
      'OrganizationalPerson',
      'inetOrgPerson',
      'posixAccount',
      'osuPerson',
      'shadowAccount',
      'lpSghePerson',
      'googlePerson',
      'eduPerson',
    ],
    uid: 'aguy',
    osuUID: '12345678910',
    osuPrimaryAffiliation: 'E',
  },
  {
    dn: 'osuuid=12345678911,ou=people,o=orst.edu',
    controls: [],
    osuOfficeAddress:
      'Horticulture$USDA-ARS (HCRL)$3420 NW Orchard Ave$Corvallis, OR 97330-5014',
    postalAddress:
      'Horticulture$Oregon State University$4017 Ag and Life Science Bldg$Corvallis, OR 97331-8646',
    mail: 'anotherguy@oregonstate.edu',
    osuDepartment: 'Horticulture',
    title: 'Courtesy Appointment',
    facsimileTelephoneNumber: '1 541 867 5309',
    telephoneNumber: '1 541 867 5309',
    sn: 'Guy',
    cn: 'Guy, A Different',
    givenName: 'A',
    objectClass: [
      'top',
      'person',
      'OrganizationalPerson',
      'inetOrgPerson',
      'posixAccount',
      'osuPerson',
      'shadowAccount',
      'lpSghePerson',
      'googlePerson',
      'eduPerson',
    ],
    uid: 'adiffguy',
    osuUID: '12345678911',
    osuPrimaryAffiliation: 'E',
  },
];

export {
  singleResult,
  multiResult,
  noQueryParams,
  people,
  rawDirectories,
  fakeBaseUrl,
};
