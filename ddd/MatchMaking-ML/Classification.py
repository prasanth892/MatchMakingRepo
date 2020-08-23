# Loading the Libraries and Data
import pandas as pd
pd.set_option('display.max_colwidth', 500)
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import _pickle as pickle
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import silhouette_score, davies_bouldin_score
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
from sklearn.pipeline import Pipeline
from tqdm import tqdm_notebook as tqdm

# Loading in the original unclustered DF
with open("profiles.pkl",'rb') as fp:
    raw_df = pickle.load(fp)

# Loading in the clustered DF
with open("clustered_profiles.pkl",'rb') as fp:
    cluster_df = pickle.load(fp)


# Instantiating a new DF row to append later
new_profile = pd.DataFrame(columns=raw_df.columns)


from flask import Flask, jsonify, request

app = Flask(__name__)

# @app.route('/<json:userinfo>', methods=['POST'])
# def welcomeMessage(userinfo):
#     return jsonify({
#             "UserId": str(userinfo),
#         })
#     # return "UserId:"  + str(top_10_sim) + "\n"


# if(__name__ == "__main__"):
#     app.run()


scoreList = [8,8,3,8,6,8,7]

# # Adding random values for new data
# for i in new_profile.columns[1:]:
    # new_profile[i] = np.random.randint(0,10,1)
  

new_profile['Movies'] = [8] # assign web api data here
new_profile['TV'] = [6]
new_profile['Religion'] = [8]
new_profile['Music'] = [9]
new_profile['Sports'] = [9]
new_profile['Books'] = [0]
new_profile['Politics'] = [8]

# 2	3	6	6	1	8	5

print(new_profile.columns.values)


# Printing an user interface for inputting new values
print("Enter new profile information...\n\nExample Bio:\nBacon enthusiast. Falls down a lot. Freelance social media fan. Infuriatingly humble introvert.")

# Asking for new profile data
new_profile['Bios'] = input("Enter a Bio for yourself: ")

# Indexing that new profile data
new_profile.index = [raw_df.index[-1] + 1]



from sklearn.dummy import DummyClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC

# Assigning the split variables
X = cluster_df.drop(["Cluster #"], 1)
y = cluster_df['Cluster #']

## Vectorizing
# Instantiating the Vectorizer
vectorizer = CountVectorizer()

# Fitting the vectorizer to the Bios
x = vectorizer.fit_transform(X['Bios'])

# Creating a new DF that contains the vectorized words
df_wrds = pd.DataFrame(x.toarray(), columns=vectorizer.get_feature_names())

# Concating the words DF with the original DF
X = pd.concat([X, df_wrds], axis=1)

# Dropping the Bios because it is no longer needed in place of vectorization
X.drop(['Bios'], axis=1, inplace=True)


## Scaling the Data
scaler = MinMaxScaler()

X = pd.DataFrame(scaler.fit_transform(X), index=X.index, columns=X.columns)

# Vectorizing the new data
vect_new_prof = vectorizer.transform(new_profile['Bios'])

# Quick DF of the vectorized words
new_vect_w = pd.DataFrame(vect_new_prof.toarray(), columns=vectorizer.get_feature_names(), index=new_profile.index)

# Concatenating the DFs for the new profile data
new_vect_prof = pd.concat([new_profile, new_vect_w], 1).drop('Bios', 1)

# Scaling the new profile data
new_vect_prof = pd.DataFrame(scaler.transform(new_vect_prof), columns=new_vect_prof.columns, index=new_vect_prof.index)


# Train, test, split
X_train, X_test, y_train, y_test = train_test_split(X, y)

# Dummy
dummy = DummyClassifier(strategy='stratified')

# KNN
knn = KNeighborsClassifier()

# SVM
svm = SVC()

# List of models
models = [dummy, knn, svm]

# List of model names
names = ['Dummy', 'KNN', 'SVM']

# Zipping the lists
classifiers = dict(zip(names, models))

# Dictionary containing the model names and their scores
models_f1 = {}

# Looping through each model's predictions and getting their classification reports
for name, model in classifiers.items():
    # Fitting the model
    model.fit(X_train, y_train)
    
    print('\n'+ name + ' (Macro Avg - F1 Score):')
    
    # Classification Report
    report = classification_report(y_test, model.predict(X_test), output_dict=True)
    f1 = report['macro avg']['f1-score']
    
    # Assigning to the Dictionary
    models_f1[name] = f1
    
    print(f1)

# Printing out the best performing model    
print(max(models_f1, key=models_f1.get), 'Score:', max(models_f1.values()))

# Fitting the model
svm.fit(X, y)
# Classifying the new data 
designated_cluster = svm.predict(new_vect_prof)
# Narrowing down the dataset to only the designated cluster
des_cluster = (cluster_df[cluster_df['Cluster #']== designated_cluster[0]])


# Appending the new profile data
des_cluster = des_cluster.append(new_profile, sort=False)

# Fitting the vectorizer to the Bios
cluster_x = vectorizer.fit_transform(des_cluster['Bios'])

# Creating a new DF that contains the vectorized words
cluster_v = pd.DataFrame(cluster_x.toarray(), index=des_cluster.index, columns=vectorizer.get_feature_names())

# Joining the Vectorized DF to the previous DF and dropping columns
des_cluster = des_cluster.join(cluster_v).drop(['Bios', 'Cluster #'], axis=1)


## Correlations
# Trasnposing the DF so that we are correlating with the index(users) and finding the correlation
corr = des_cluster.T.corr()

# Finding the Top 10 similar or correlated users to the new user.
user_n = new_profile.index[0]

# Creating a DF with the Top 10 most similar profiles
top_10_sim = corr[[user_n]].sort_values(by=[user_n],axis=0, ascending=False)[1:11]

# Finally locating the Top 10 profiles
raw_df.loc[top_10_sim.index]



# ## Correlation
# # Trasnposing the DF so that we are correlating with the index(users) and finding the correlation
# corr = des_cluster.T.corr()

# # Finding the Top 10 similar or correlated users to the new user
# user_n = new_profile.index[0]

# # Creating a DF with the Top 10 most similar profiles
# top_10_sim = corr[[user_n]].sort_values(by=[user_n],axis=0, ascending=False)[1:11]

# # Displaying the Top 10
# raw_df.loc[top_10_sim.index]


print("\nThe User id is : " + str(user_n))

print(top_10_sim)



# @app.route('/', methods=['POST'])
# def welcomeMessage():
#     return jsonify({
#             "UserId": request.json
#         })
    # return "UserId:"  + str(top_10_sim) + "\n"


if(__name__ == "__main__"):
    app.run()
    
    
# with open("profiles.pkl", "wb") as fp:
#     pickle.dump(raw_df, fp)

# with open("clustered_profiles.pkl",'wb') as fp:
#     pickle.dump(cluster_df, fp)
    
    
# raw_df.to_csv('newAppend.csv')
# cluster_df.to_csv('clustered_profiles.csv')

