import pandas as pd
import time

start_time = time.time()
print("Loading the file...")
# Load the title.akas.tsv file
akas_df = pd.read_csv("title.akas.tsv", sep="\t", usecols=["titleId", "title", "region"], low_memory=False, dtype=str)

end_time = time.time()
elapsed_time = end_time - start_time

print("Loading the file took {:.2f} seconds.".format(elapsed_time))

start_time = time.time()
print("Filtering data...")
# Filter rows where region == 'US'
filtered_df = akas_df[(akas_df['region'] == 'US')]
end_time = time.time()
elapsed_time = end_time - start_time
filtered_df = filtered_df[["titleId", "title"]]

print("Found {} rows matching the filter.".format(len(filtered_df)))
print("filtering the file took {:.2f} seconds.".format(elapsed_time))



start_time = time.time()
print("Saving the filtered data to a new file...")
# Output the filtered DataFrame to a new .tsv file
filtered_df.to_csv("us_title.akas.tsv", sep="\t", index=False)
end_time = time.time()
elapsed_time = end_time - start_time
print("Saving new file took {:.2f} seconds.".format(elapsed_time))

print("Filtered file saved as 'us_title.akas.tsv'.")