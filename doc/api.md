Resting
=======

## user

### authenticate

POST /users/authenticate


Body schema
```
{
  "*user": {
    "*id": "[string]"
  }
}
```

Examples

* URL: /users/authenticate
* Status: 200
* Body
```
{
  "user": {
    "id": "0c9770b2-dbae-4eca-8685-ffba2a00e379"
  }
}
```

* Response
```
{
  "name": "banduk"
}
```



