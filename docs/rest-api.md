<!-- Generator: Widdershins v4.0.1 -->

<h1 id="open-fixture-library-api">Open Fixture Library API v1.0</h1>

> Scroll down for example requests and responses.

Base URLs:

* <a href="https://open-fixture-library.org/api/v1">https://open-fixture-library.org/api/v1</a>

* <a href="http://localhost:3000/api/v1">http://localhost:3000/api/v1</a>

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

> 400 Response

```json
{
  "error": "Some error message."
}
```

<h3 id="getsearchresults-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Fixture keys matching the queries.|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|

<h3 id="getsearchresults-responseschema">Response Schema</h3>

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Content-Type|string||The response is JSON.|
|200|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|200|Vary|string||Indicates that the response varies by Origin.|
|400|Content-Type|string||The response is JSON.|
|400|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|400|Vary|string||Indicates that the response varies by Origin.|

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

> 400 Response

```json
{
  "error": "Some error message."
}
```

<h3 id="createfeedbackissue-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Issue created or error occurred.|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|

<h3 id="createfeedbackissue-responseschema">Response Schema</h3>

Status Code **201**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» issueUrl|string(uri)¦null|true|none|none|
|» error|string¦null|true|none|none|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|201|Content-Type|string||The response is JSON.|
|201|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|201|Vary|string||Indicates that the response varies by Origin.|
|400|Content-Type|string||The response is JSON.|
|400|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|400|Vary|string||Indicates that the response varies by Origin.|

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
|» error|string|true|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|201|Content-Type|string||The response is JSON.|
|201|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|201|Vary|string||Indicates that the response varies by Origin.|
|400|Content-Type|string||The response is JSON.|
|400|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|400|Vary|string||Indicates that the response varies by Origin.|

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
|plugin|body|string|true|none|
|fileName|body|string|true|none|
|fileContentBase64|body|string(base64)|true|none|
|author|body|string|true|none|

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
|» error|string|true|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|201|Content-Type|string||The response is JSON.|
|201|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|201|Vary|string||Indicates that the response varies by Origin.|
|400|Content-Type|string||The response is JSON.|
|400|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|400|Vary|string||Indicates that the response varies by Origin.|

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
|fixtureCreateResult|body|object|true|none|
|» manufacturers|body|object|true|none|
|» fixtures|body|object|true|none|
|» warnings|body|object|true|none|
|» errors|body|object|true|none|
|githubUsername|body|string¦null|true|none|
|githubComment|body|string¦null|true|none|

> Example responses

> 201 Response

```json
{
  "pullRequestUrl": "http://example.com"
}
```

<h3 id="submitfixtures-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|GitHub pull request created|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|

<h3 id="submitfixtures-responseschema">Response Schema</h3>

Status Code **201**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» pullRequestUrl|string(uri)|true|none|none|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|201|Content-Type|string||The response is JSON.|
|201|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|201|Vary|string||Indicates that the response varies by Origin.|
|400|Content-Type|string||The response is JSON.|
|400|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|400|Vary|string||Indicates that the response varies by Origin.|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="open-fixture-library-api-manufacturers">manufacturers</h1>

## getManufacturers

<a id="opIdgetManufacturers"></a>

`GET /manufacturers`

Returns general information about all manufacturers.

> Example responses

> 200 Response

```json
{
  "property1": {
    "name": "string",
    "fixtureCount": 0,
    "color": "string"
  },
  "property2": {
    "name": "string",
    "fixtureCount": 0,
    "color": "string"
  }
}
```

<h3 id="getmanufacturers-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Manufacturer list returned|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|

<h3 id="getmanufacturers-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» **additionalProperties**|object|false|none|none|
|»» name|string|true|none|none|
|»» fixtureCount|integer|true|none|none|
|»» color|string|true|none|none|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Content-Type|string||The response is JSON.|
|200|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|200|Vary|string||Indicates that the response varies by Origin.|
|400|Content-Type|string||The response is JSON.|
|400|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|400|Vary|string||Indicates that the response varies by Origin.|

<aside class="success">
This operation does not require authentication
</aside>

## getManufacturerByKey

<a id="opIdgetManufacturerByKey"></a>

`GET /manufacturers/{manufacturerKey}`

Returns information about a specific manufacturer.

<h3 id="getmanufacturerbykey-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|manufacturerKey|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "key": "string",
  "name": "string",
  "comment": "string",
  "website": "http://example.com",
  "rdmId": 0,
  "color": "string",
  "fixtures": [
    {
      "key": "string",
      "name": "string",
      "categories": [
        "string"
      ]
    }
  ]
}
```

<h3 id="getmanufacturerbykey-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Manufacturer details returned|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Not Found|Inline|

<h3 id="getmanufacturerbykey-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» key|string|true|none|none|
|» name|string|true|none|none|
|» comment|string|false|none|none|
|» website|string(uri)|false|none|none|
|» rdmId|integer|false|none|none|
|» color|string|true|none|none|
|» fixtures|[object]|true|none|none|
|»» key|string|true|none|none|
|»» name|string|true|none|none|
|»» categories|[string]|false|none|none|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

Status Code **404**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Content-Type|string||The response is JSON.|
|200|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|200|Vary|string||Indicates that the response varies by Origin.|
|400|Content-Type|string||The response is JSON.|
|400|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|400|Vary|string||Indicates that the response varies by Origin.|
|404|Content-Type|string||The response is JSON.|
|404|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|404|Vary|string||Indicates that the response varies by Origin.|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="open-fixture-library-api-categories">categories</h1>

## getCategories

<a id="opIdgetCategories"></a>

`GET /categories`

Returns general information about all fixture categories.

> Example responses

> 200 Response

```json
[
  {
    "name": "string",
    "fixtureCount": 0
  }
]
```

<h3 id="getcategories-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Category list returned|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|

<h3 id="getcategories-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» name|string|true|none|none|
|» fixtureCount|integer|true|none|none|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Content-Type|string||The response is JSON.|
|200|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|200|Vary|string||Indicates that the response varies by Origin.|
|400|Content-Type|string||The response is JSON.|
|400|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|400|Vary|string||Indicates that the response varies by Origin.|

<aside class="success">
This operation does not require authentication
</aside>

## getCategoryByName

<a id="opIdgetCategoryByName"></a>

`GET /categories/{categoryName}`

Returns fixture information for a specific category.

<h3 id="getcategorybyname-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|categoryName|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "fixtures": [
    {
      "key": "string",
      "name": "string",
      "categories": [
        "string"
      ],
      "color": "string"
    }
  ]
}
```

<h3 id="getcategorybyname-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Category fixtures returned|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Not Found|Inline|

<h3 id="getcategorybyname-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» fixtures|[object]|true|none|none|
|»» key|string|true|none|none|
|»» name|string|true|none|none|
|»» categories|[string]|true|none|none|
|»» color|string|true|none|none|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

Status Code **404**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Content-Type|string||The response is JSON.|
|200|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|200|Vary|string||Indicates that the response varies by Origin.|
|400|Content-Type|string||The response is JSON.|
|400|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|400|Vary|string||Indicates that the response varies by Origin.|
|404|Content-Type|string||The response is JSON.|
|404|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|404|Vary|string||Indicates that the response varies by Origin.|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="open-fixture-library-api-rdm">rdm</h1>

## getRdmLookup

<a id="opIdgetRdmLookup"></a>

`GET /rdm`

Returns the manufacturer and fixture matching the given RDM IDs.

<h3 id="getrdmlookup-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|manufacturerId|query|integer|true|none|
|modelId|query|integer|false|none|

> Example responses

> 200 Response

```json
{
  "manufacturerKey": "string",
  "manufacturerName": "string",
  "fixtureKey": "string"
}
```

<h3 id="getrdmlookup-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|RDM lookup result returned|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|

<h3 id="getrdmlookup-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» manufacturerKey|string¦null|true|none|none|
|» manufacturerName|string¦null|true|none|none|
|» fixtureKey|string¦null|true|none|none|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Content-Type|string||The response is JSON.|
|200|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|200|Vary|string||Indicates that the response varies by Origin.|
|400|Content-Type|string||The response is JSON.|
|400|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|400|Vary|string||Indicates that the response varies by Origin.|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="open-fixture-library-api-plugins">plugins</h1>

## getPlugins

<a id="opIdgetPlugins"></a>

`GET /plugins`

Returns general information about import and export plugins.

> Example responses

> 200 Response

```json
{
  "importPlugins": [
    "string"
  ],
  "exportPlugins": [
    "string"
  ],
  "data": {
    "property1": {
      "name": "string",
      "outdated": true,
      "newPlugin": "string",
      "importPluginVersion": "string",
      "exportPluginVersion": "string",
      "exportTests": [
        "string"
      ]
    },
    "property2": {
      "name": "string",
      "outdated": true,
      "newPlugin": "string",
      "importPluginVersion": "string",
      "exportPluginVersion": "string",
      "exportTests": [
        "string"
      ]
    }
  }
}
```

<h3 id="getplugins-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Plugin list returned|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|

<h3 id="getplugins-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» importPlugins|[string]|true|none|none|
|» exportPlugins|[string]|true|none|none|
|» data|object|true|none|none|
|»» **additionalProperties**|object|false|none|none|
|»»» name|string|true|none|none|
|»»» outdated|boolean|false|none|none|
|»»» newPlugin|string|false|none|none|
|»»» importPluginVersion|string|false|none|none|
|»»» exportPluginVersion|string|false|none|none|
|»»» exportTests|[string]|false|none|none|

*allOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|any|false|none|none|

*oneOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|object|false|none|none|

*xor*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|any|false|none|none|

*not*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»»» *anonymous*|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»»»» *anonymous*|object|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»»»» *anonymous*|object|false|none|none|

*and*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|any|false|none|none|

*oneOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|object|false|none|none|

*xor*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|any|false|none|none|

*not*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»»» *anonymous*|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»»»» *anonymous*|object|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»»»» *anonymous*|object|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|outdated|true|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Content-Type|string||The response is JSON.|
|200|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|200|Vary|string||Indicates that the response varies by Origin.|
|400|Content-Type|string||The response is JSON.|
|400|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|400|Vary|string||Indicates that the response varies by Origin.|

<aside class="success">
This operation does not require authentication
</aside>

## getPluginByKey

<a id="opIdgetPluginByKey"></a>

`GET /plugins/{pluginKey}`

Returns information about a specific import and export plugin. If an outdated plugin is requested, the information for the renamed plugin is returned.

<h3 id="getpluginbykey-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|pluginKey|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "key": "string",
  "name": "string",
  "previousVersions": {
    "property1": "string",
    "property2": "string"
  },
  "description": "string",
  "links": {
    "property1": "http://example.com",
    "property2": "http://example.com"
  },
  "fixtureUsage": "string",
  "fileLocations": {
    "subDirectoriesAllowed": true,
    "property1": {
      "main": "string",
      "user": "string"
    },
    "property2": {
      "main": "string",
      "user": "string"
    }
  },
  "additionalInfo": "string",
  "helpWanted": "string",
  "exportPluginVersion": "string",
  "importPluginVersion": "string"
}
```

<h3 id="getpluginbykey-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Plugin details returned|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Bad request|Inline|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Not Found|Inline|

<h3 id="getpluginbykey-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» key|string|true|none|none|
|» name|string|true|none|none|
|» previousVersions|object|true|none|none|
|»» **additionalProperties**|string|false|none|none|
|» description|string|true|none|none|
|» links|object|true|none|none|
|»» **additionalProperties**|string(uri)|false|none|none|
|» fixtureUsage|string|false|none|none|
|» fileLocations|object|false|none|none|
|»» **additionalProperties**|object|false|none|none|
|»»» main|string|false|none|none|
|»»» user|string|false|none|none|
|»» subDirectoriesAllowed|boolean|false|none|none|
|» additionalInfo|string|false|none|none|
|» helpWanted|string|false|none|none|
|» exportPluginVersion|string|false|none|none|
|» importPluginVersion|string|false|none|none|

Status Code **400**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

Status Code **404**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» error|string|true|none|none|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|200|Content-Type|string||The response is JSON.|
|200|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|200|Vary|string||Indicates that the response varies by Origin.|
|400|Content-Type|string||The response is JSON.|
|400|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|400|Vary|string||Indicates that the response varies by Origin.|
|404|Content-Type|string||The response is JSON.|
|404|Access-Control-Allow-Origin|string||Added when the request includes an Origin header or the origin is not allowed.|
|404|Vary|string||Indicates that the response varies by Origin.|

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
|error|string|true|none|none|

