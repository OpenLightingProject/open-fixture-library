<!-- Generator: Widdershins v4.0.1 -->

<h1 id="open-fixture-library-api">Open Fixture Library API v1.0</h1>

> Scroll down for example requests and responses.

Base URLs:

* <a href="https://open-fixture-library.org/api/v1">https://open-fixture-library.org/api/v1</a>

* <a href="http://localhost:5000/api/v1">http://localhost:5000/api/v1</a>

<h1 id="open-fixture-library-api-root">root</h1>

## getSearchResults

<a id="opIdgetSearchResults"></a>

`POST /get-search-results`

Return search results for given parameters.

> Body parameter

```json
{
  "searchQuery": "string",
  "manufacturersQuery": [
    "string"
  ],
  "categoriesQuery": [
    "string"
  ]
}
```

<h3 id="getsearchresults-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|searchQuery|body|string|true|none|
|manufacturersQuery|body|[string]|true|none|
|categoriesQuery|body|[string]|true|none|

> Example responses

> 200 Response

```json
[
  "showtec/phantom-3r-beam",
  "showtec/phantom-50-led-spot",
  "showtec/phantom-140-led-spot",
  "showtec/phantom-matrix-fx"
]
```

<h3 id="getsearchresults-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Fixture keys matching the queries.|Inline|

<h3 id="getsearchresults-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## createFeedbackIssue

<a id="opIdcreateFeedbackIssue"></a>

`POST /submit-feedback`

Takes the input from the client side script and creates a GitHub issue with the given feedback.

> Body parameter

```json
{
  "type": "fixture",
  "context": "string",
  "location": "string",
  "helpWanted": "string",
  "message": "string",
  "githubUsername": "string"
}
```

<h3 id="createfeedbackissue-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|type|body|string|true|none|
|context|body|string|true|The fixture key or plugin key.|
|location|body|string¦null|true|none|
|helpWanted|body|string¦null|true|none|
|message|body|string|true|none|
|githubUsername|body|string|true|none|

#### Enumerated Values

|Parameter|Value|
|---|---|
|type|fixture|
|type|capability|
|type|plugin|

> Example responses

> 201 Response

```json
{
  "issueUrl": "https://github.com/OpenLightingProject/open-fixture-library/issues/1154"
}
```

<h3 id="createfeedbackissue-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Issue created or error occured.|Inline|

<h3 id="createfeedbackissue-responseschema">Response Schema</h3>

Status Code **201**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» issueUrl|string¦null|false|none|none|
|» error|string¦null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="open-fixture-library-api-fixtures">fixtures</h1>

## createFixtureFromEditor

<a id="opIdcreateFixtureFromEditor"></a>

`POST /fixtures/from-editor`

Converts the given editor fixture data into OFL fixtures and responds with a FixtureCreateResult.

> Body parameter

```json
[
  {}
]
```

> Example responses

> 201 Response

```json
{
  "manufacturers": {
    "man-key": {
      "name": "Manufacturer name",
      "website": "https://example.org"
    }
  },
  "fixtures": {
    "man-key/fix-key": {
      "name": "Fixture name",
      "$comment": "…"
    }
  },
  "warnings": {
    "man-key/fix-key": [
      "Some warning for fixture man-key/fix-key."
    ]
  },
  "errors": {
    "man-key/fix-key": []
  }
}
```

<h3 id="createfixturefromeditor-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Fixture successfully imported|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|

<h3 id="createfixturefromeditor-responseschema">Response Schema</h3>

Status Code **201**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» manufacturers|object|true|none|none|
|» fixtures|object|true|none|none|
|» warnings|object|true|none|none|
|» errors|object|true|none|none|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## importFixtureFile

<a id="opIdimportFixtureFile"></a>

`POST /fixtures/import`

Imports the uploaded fixture file and responds with a FixtureCreateResult.

> Body parameter

```json
{
  "plugin": "string",
  "fileName": "string",
  "fileContentBase64": "string",
  "author": "string"
}
```

<h3 id="importfixturefile-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|plugin|body|string|false|none|
|fileName|body|string|false|none|
|fileContentBase64|body|string(base64)|false|none|
|author|body|string|false|none|

> Example responses

> 201 Response

```json
{
  "manufacturers": {
    "man-key": {
      "name": "Manufacturer name",
      "website": "https://example.org"
    }
  },
  "fixtures": {
    "man-key/fix-key": {
      "name": "Fixture name",
      "$comment": "…"
    }
  },
  "warnings": {
    "man-key/fix-key": [
      "Some warning for fixture man-key/fix-key."
    ]
  },
  "errors": {
    "man-key/fix-key": []
  }
}
```

<h3 id="importfixturefile-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Fixture successfully imported|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|

<h3 id="importfixturefile-responseschema">Response Schema</h3>

Status Code **201**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» manufacturers|object|true|none|none|
|» fixtures|object|true|none|none|
|» warnings|object|true|none|none|
|» errors|object|true|none|none|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## submitFixtures

<a id="opIdsubmitFixtures"></a>

`POST /fixtures/submit`

Creates a GitHub pull request with the given fixture data. Includes warnings, errors, GitHub username and GitHub comment in the PR description.

> Body parameter

```json
{
  "fixtureCreateResult": {
    "manufacturers": {
      "man-key": {
        "name": "Manufacturer name",
        "website": "https://example.org"
      }
    },
    "fixtures": {
      "man-key/fix-key": {
        "name": "Fixture name",
        "$comment": "…"
      }
    },
    "warnings": {
      "man-key/fix-key": [
        "Some warning for fixture man-key/fix-key."
      ]
    },
    "errors": {
      "man-key/fix-key": []
    }
  },
  "githubUsername": "string",
  "githubComment": "string"
}
```

<h3 id="submitfixtures-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|fixtureCreateResult|body|object|false|none|
|» manufacturers|body|object|true|none|
|» fixtures|body|object|true|none|
|» warnings|body|object|true|none|
|» errors|body|object|true|none|
|githubUsername|body|string¦null|false|none|
|githubComment|body|string¦null|false|none|

> Example responses

> 201 Response

```json
{
  "pullRequestUrl": "string"
}
```

<h3 id="submitfixtures-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|OK|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|

<h3 id="submitfixtures-responseschema">Response Schema</h3>

Status Code **201**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» pullRequestUrl|string|false|none|none|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

# Schemas

<h2 id="tocS_FixtureCreateResult">FixtureCreateResult</h2>
<!-- backwards compatibility -->
<a id="schemafixturecreateresult"></a>
<a id="schema_FixtureCreateResult"></a>
<a id="tocSfixturecreateresult"></a>
<a id="tocsfixturecreateresult"></a>

```json
{
  "manufacturers": {
    "man-key": {
      "name": "Manufacturer name",
      "website": "https://example.org"
    }
  },
  "fixtures": {
    "man-key/fix-key": {
      "name": "Fixture name",
      "$comment": "…"
    }
  },
  "warnings": {
    "man-key/fix-key": [
      "Some warning for fixture man-key/fix-key."
    ]
  },
  "errors": {
    "man-key/fix-key": []
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|manufacturers|object|true|none|none|
|fixtures|object|true|none|none|
|warnings|object|true|none|none|
|errors|object|true|none|none|

<h2 id="tocS_Error">Error</h2>
<!-- backwards compatibility -->
<a id="schemaerror"></a>
<a id="schema_Error"></a>
<a id="tocSerror"></a>
<a id="tocserror"></a>

```json
{
  "error": "Some error message."
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|error|string|false|none|none|

