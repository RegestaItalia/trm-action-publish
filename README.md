# trm-action-publish

This action can be used to publish an ABAP package to a TRM Registry.

## Runner Requirements

The runner used for this action must have these requirements:
- Can reach your development SAP system (RFC/REST)
- Can reach the TRM Registry
- Must have installed
    - Node.Js
    - [SAP NW RFC SDK](https://docs.trmregistry.com/#/client/docs/setup?id=sap-nw-rfc-sdk) (if connecting via RFC)

## Usage

To view an example of usage, refer to [this article](https://docs.trmregistry.com/#/client/docs/examples/githubActions).

### REST connection

```
- name: TRM publish package
  uses: RegestaItalia/trm-action-publish@latest
  with:
    systemRESTEndpoint: ${{ vars.ENDPOINT }}
    systemLoginUser: ${{ vars.USERNAME }}
    systemLoginPassword: ${{ secrets.PASSWORD }}
    systemLoginLanguage: 'EN'
    name: 'myPackage'
    version: 'latest'
    registryToken: ${{ secrets.TRM_TOKEN }}
    private: false
    abapPackage: 'ZMYPACKAGE'
    shortDescription: 'This is a test publish via Github Actions'
    releaseTransportTarget: 'TRM'
    authors: 'User <user@email.com>'
    keywords: 'test, mypackage'
```

### RFC connection

```
- name: TRM publish package
  uses: RegestaItalia/trm-action-publish@latest
  with:
    systemRFCDest: ${{ vars.DEST }}
    systemRFCAsHost: ${{ vars.ASHOST }}
    systemRFCSysnr: ${{ vars.SYSNR }}
    systemRFCSAPRouter: ${{ vars.SAPROUTER }}
    systemLoginClient: ${{ vars.CLIENT }}
    systemLoginUser: ${{ vars.USERNAME }}
    systemLoginPassword: ${{ secrets.PASSWORD }}
    systemLoginLanguage: 'EN'
    name: 'myPackage'
    version: 'latest'
    registryToken: ${{ secrets.TRM_TOKEN }}
    private: false
    abapPackage: 'ZMYPACKAGE'
    shortDescription: 'This is a test publish via Github Actions'
    releaseTransportTarget: 'TRM'
    authors: 'User <user@email.com>'
    keywords: 'test, mypackage'
```

# Contributing <!-- {docsify-remove} -->

Like every other TRM open-soruce projects, contributions are always welcomed ❤️.

Make sure to open an issue first.

Contributions will be merged upon approval.

[Click here](https://docs.trmregistry.com/#/CONTRIBUTING) for the full list of TRM contribution guidelines.

[<img src="https://trmregistry.com/public/contributors?image=true">](https://docs.trmregistry.com/#/?id=contributors)
