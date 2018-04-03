# Retail Store Locator - Server

Serves the list of all current and future retail store locations. Syncs data from a Google Sheet to a MongoDB database.

## Base URL

`https://murmuring-atoll-18859.herokuapp.com`

This app is currently hosted by Heroku, so the base URL is randomly generated. The app will be migrated to GCP shortly.

# Endpoints

## **Retailers**

### **List all retailers**

Returns a list of all currently active retailers within a given search radius, sorted nearest to furthest from origin coordinates. Can optionally return all retailers, regardless of location or launch date.

_Definition_

`GET /retailers`

_Arguments_

| Argument                 | Description                                                                                              | Required |
| ------------------------ | -------------------------------------------------------------------------------------------------------- | :------: |
| `lng`                    | A number representing the longitude of the search origin.                                                |          |
| `lat`                    | A number representing the longitude of the search origin.                                                |          |
| `searchRadius`           | A number representing the search radius in miles.                                                        |          |
| `includeFutureLocations` | A boolean that dictates whether the API should return retailers that are not yet active. Default: false. |          |

_Sample Request_

```javascript
GET https://murmuring-atoll-18859.herokuapp.com/retailers?lng=-118.58300465970834&lat=34.11903902186396&searchRadius=50
```

_Sample Response_

```javascript
[{
		"location": {
			"type": "Point",
			"coordinates": [-118.6132747,
				34.1473553
			]
		},
		"recipes_offered": [],
		"_id": "5ac28c9d34a56f25d5e1107f",
		"name": "Gelsons",
		"address_1": "22277 Mulholland Highway",
		"address_2": "",
		"city": "Calabasas",
		"state": "CA",
		"zip": "91302",
		"launch_date": "2017-08-29T07:00:00.000Z",
		"__v": 0
	},
	{
		"location": {
			"type": "Point",
			"coordinates": [-118.5280391,
				34.0478815
			]
		},
		"recipes_offered": [],
		"_id": "5ac28c9c34a56f25d5e1107c",
		"name": "Gelsons",
		"address_1": "15424 Sunset Blvd",
		"address_2": "",
		"city": "Pacific Palisades",
		"state": "CA",
		"zip": "90272",
		"launch_date": "2017-08-29T07:00:00.000Z",
		"__v": 0
  },
  ...
]
```

### **Sync retailers**

Retrieves a published Google Sheet containing an updated list of all retailers and adds any retailers not already present in the database.

_Definition_

`GET /retailers/sync`

_Sample Request_

```javascript
GET https://murmuring-atoll-18859.herokuapp.com/retailers/sync
```

_Sample Response_

* New retailers are synced to the database, with errors due to address validation failure

```javascript
{
    "errors": [
        {
            "error": "ZERO_RESULTS",
            "retailer": {
                "name": "COSTCO",
                "address_1": "1160 SAXON DRIVE",
                "address_2": "",
                "city": "TUKWILA",
                "state": "WA",
                "zip": "98188",
                "launch_date": "1/22/2018"
            }
        },
        {
            "error": "ZERO_RESULTS",
            "retailer": {
                "name": "HYVEE",
                "address_1": "13400 W 187TH ST",
                "address_2": "",
                "city": "LENEXA",
                "state": "KS",
                "zip": "66215",
                "launch_date": "3/28/2018"
            }
        }
    ],
    "message": "301 of 303 retailers added successfully.",
    "new_retailers": [
        {
            "location": {
                "type": "Point",
                "coordinates": [
                    -118.3959542,
                    34.1562727
                ]
            },
            "recipes_offered": [],
            "_id": "5ac28c9c34a56f25d5e1107b",
            "name": "Gelsons",
            "address_1": "4738 Laurel Canyon Blvd",
            "address_2": "",
            "city": "Valley Village",
            "state": "CA",
            "zip": "91607",
            "launch_date": "2017-08-29T07:00:00.000Z",
            "__v": 0
        },
        ...
    ]
}
```

* Case when no new retailers are added

```javascript
{
    "errors": [],
    "message": "No new retailers added.",
    "new_retailers": []
}
```
