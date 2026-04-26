# Wireframes

Mobile-first. All views are single-column, touch-friendly.

### Home — Recipe List
```
+-----------------------------+
|  Uppskriftabok          [+] |
+-----------------------------+
| [?] Search recipes...       |
+-----------------------------+
| [All] [Dinner] [Soup]       |
| [Baking] [Plan ahead]       |
+-----------------------------+
| +-------------------------+ |
| | Kjotbollar              | |
| | #dinner #icelandic      | |
| +-------------------------+ |
| +-------------------------+ |
| | Baguette      [!] Plan  | |
| | #baking #bread          | |
| +-------------------------+ |
| +-------------------------+ |
| | Hummus                  | |
| | #starter #vegetarian    | |
| +-------------------------+ |
+-----------------------------+
```

### Recipe Detail
```
+-----------------------------+
| < Kjotbollar                |
+-----------------------------+
| Classic Icelandic meatballs |
+-----------------------------+
| Servings:  [2] [4] [6] [8]  |
+-----------------------------+
| Ingredients                 |
| [ ] 500 g    ground beef    |
| [ ] 1        egg            |
| [ ] 1/2 dl   breadcrumbs    |
| [ ] 1 tsp    salt           |
+-----------------------------+
| How to                      |
| Mix all ingredients         |
| together in a bowl.         |
| Form into small balls.      |
| Fry in butter on medium     |
| heat for 8-10 minutes.      |
+-----------------------------+
|       [ Cook Mode ]         |
+-----------------------------+
```

### Recipe Detail — Plan Ahead notice
```
+-----------------------------+
| < Baguette                  |
+-----------------------------+
| +-------------------------+ |
| | [!] Start the day before| |
| |     Dough must rest     | |
| |     overnight           | |
| +-------------------------+ |
|  ...                        |
+-----------------------------+
```

### Add Recipe
```
+-----------------------------+
| < Add Recipe                |
+-----------------------------+
| Import from URL             |
| +-------------------------+ |
| | https://...             | |
| +-------------------------+ |
|      [Import Recipe]        |
+-----------------------------+
| Title                       |
| +-------------------------+ |
| |                         | |
| +-------------------------+ |
| Description                 |
| +-------------------------+ |
| |                         | |
| +-------------------------+ |
| Base servings               |
| [2] [4] [6] [8]             |
| Tags (comma separated)      |
| +-------------------------+ |
| |                         | |
| +-------------------------+ |
| [ ] Add prep/cook times     |
| +----------+  +----------+  | <- appears when checked
| | 15 min   |  | 30 min   |  |
| +----------+  +----------+  |
+-----------------------------+
| [ ] Requires advance prep   |
| +-------------------------+ | <- appears when checked
| | Dough must rest...      | |
| +-------------------------+ |
+-----------------------------+
| Ingredients              [+]|
| [Parse ingredients]         |
| +------+ +----+ +--------+  |
| | 500  | | g  | | beef   |  |
| +------+ +----+ +--------+  |
| +------+ +----+ +--------+  |
| | 1    | |    | | egg    |  |
| +------+ +----+ +--------+  |
+-----------------------------+
| How to                      |
| +-------------------------+ |
| | Mix all ingredients...  | |
| |                         | |
| |                         | |
| +-------------------------+ |
+-----------------------------+
|        [ Save Recipe ]      |
+-----------------------------+
```

### Grocery List
```
+-----------------------------+
|  Grocery List               |
+-----------------------------+
| From: Kjotbollar            |
| [x] 500 g ground beef       |
| [ ] 1 egg                   |
| [ ] 1/2 dl breadcrumbs      |
|                             |
| From: Hummus                |
| [ ] 400 g chickpeas         |
| [ ] 2 tbsp tahini           |
+-----------------------------+
| [Clear done]    [Clear all] |
+-----------------------------+
```

### Cook Mode
```
+-----------------------------+
| Kjotbollar       [≡] [x]    |
+-----------------------------+
|                             |
| Mix all ingredients         |
| together in a bowl.         |
| Form into small balls.      |
| Fry in butter on medium     |
| heat for 8-10 minutes.      |
|                             |
|                             |
+-----------------------------+
```

#### Cook Mode — Ingredients panel (slide up)
```
+-----------------------------+
| Ingredients             [x] |
|  500 g    ground beef       |
|  1        egg               |
|  1/2 dl   breadcrumbs       |
+-----------------------------+
```
