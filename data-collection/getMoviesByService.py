import requests
import json

# netflix, prime.subscription, hbo, hulu, disney, apple
service = "disney"

with open("api-config.json", "r", encoding="utf-8") as config_file:
    config = json.load(config_file)  # Load JSON as a Python dictionary

# Step 2: Access values
api_url = config.get("api_url")
api_key = config.get("api_key")
api_host = config.get("api_host")

url = config.get("api_url")

headers = {
	"x-rapidapi-key": config.get("api_key"),
	"x-rapidapi-host": config.get("api_host")
}

has_more = True
next_cursor = None
count = 0

cursorFileName = "next_cursor_{}.txt".format(service)
try :
    with open(cursorFileName, "r", encoding="utf-8") as txt_file:
        next_cursor = txt_file.read().strip() 
    print("Obtained next cursor: " + next_cursor)
except (FileNotFoundError, json.JSONDecodeError):
    next_cursor = None
    print("No cursor found")

moviesFileName = "movies_{}.json".format(service)
try:
    with open(moviesFileName, "r", encoding="utf-8") as json_file:
        all_movies = json.load(json_file)  # Load JSON data into a Python list
    print("movie list obtained")
except (FileNotFoundError, json.JSONDecodeError):
    all_movies = []  # If file doesn't exist or is empty, start with an empty list
    print("no movie list found")

while has_more and count < 50 :
    if next_cursor :
        querystring = {"country":"us","series_granularity":"show","order_direction":"asc","order_by":"original_title","genres_relation":"and","output_language":"en","catalogs":service,"show_type":"movie", "cursor": next_cursor}
    else :
        querystring = {"country":"us","series_granularity":"show","order_direction":"asc","order_by":"original_title","genres_relation":"and","output_language":"en","catalogs":service,"show_type":"movie"}

    response = requests.get(url, headers=headers, params=querystring)

    data = response.json()
    shows = data.get("shows", [])
    has_more = data.get("hasMore", False)
    next_cursor = data.get("nextCursor", None)

    all_movies.extend(shows)
    count += 1


print("Total shows so far: {}".format(len(all_movies)))

# Save to JSON file
jsonfilename = "movies_{}.json".format(service)
with open(jsonfilename, "w", encoding="utf-8") as json_file:
    json.dump(all_movies, json_file, indent=4, ensure_ascii=False)

print("Saved movies back to json file: " + jsonfilename)

# Save next_cursor to a text file
if next_cursor == None :
    next_cursor = "Reached End of {}".format(service)
textfilename = "next_cursor_{}.txt".format(service)
with open(textfilename, "w", encoding="utf-8") as txt_file:
    txt_file.write(str(next_cursor))  # Convert to string in case it's None or another type

print("Saved next_cursor to file: " + textfilename)







