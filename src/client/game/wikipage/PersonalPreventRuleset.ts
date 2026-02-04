// PersonalPreventRuleset
export const RuleJsonSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TextFilterConfig",
  "description": "A configuration object containing multiple text filter rules",
  "type": "object",
  "properties": {
    "rules": {
      "type": "array",
      "description": "Array of text filtering rules",
      "items": {
        "type": "object",
        "properties": {
          "pattern": {
            "type": "string",
            "description": "Regex pattern to match"
          },
          "caseinsensitive": {
            "type": "string",
            "enum": [
              "lowercase",
              "uppercase",
              "preserve"
            ],
            "description": "Text case handling"
          },
          "stripSpecialCharacters": {
            "type": "boolean",
            "description": "Remove special characters before matching"
          },
          "stripNonAsciiCharacters": {
            "type": "boolean",
            "description": "Remove non-ASCII characters before matching"
          },
          "action": {
            "type": [
              "string",
              "null"
            ],
            "enum": [
              "report",
              "remove",
              null
            ],
            "description": "Action to take on match"
          }
        },
        "required": [
          "pattern",
          "caseinsensitive",
          // "stripSpecialCharacters",
          // "stripNonAsciiCharacters"
        ],
        "additionalProperties": false
      },
      "minItems": 1
    }
  },
  "required": [
    "rules"
  ],
  "additionalProperties": false
}
