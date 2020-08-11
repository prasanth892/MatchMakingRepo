# Loading the Libraries and Data
import pandas as pd
pd.set_option('display.max_colwidth', 500)
import _pickle as pickle
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
        


from flask import Flask, request

app = Flask(__name__)

@app.route('/savingNewProfile', methods=['POST'])
def savingNewProfile():

    # Loading in the original unclustered DF
    with open("profiles.pkl",'rb') as fp:
        raw_df = pickle.load(fp)
    
    # Loading in the clustered DF
    with open("clustered_profiles.pkl",'rb') as fp:
        cluster_df = pickle.load(fp)
    
    
    
    # Instantiating a new DF row to append later
    new_profile = pd.DataFrame(columns=raw_df.columns)

    
    data =  request.get_json()

    if request.json:

        print('\n<---NEW REQUEST---->\n')
        
        # assign web api data here
        new_profile['Bios'] = [data['bio']]  
        new_profile['Movies'] = [data['scoreList'][0]] 
        new_profile['TV'] = [data['scoreList'][1]]
        new_profile['Religion'] = [data['scoreList'][2]]
        new_profile['Music'] = [data['scoreList'][3]]
        new_profile['Sports'] = [data['scoreList'][4]]
        new_profile['Books'] = [data['scoreList'][5]]
        new_profile['Politics'] = [data['scoreList'][6]]
        
        for i in new_profile.columns[0:]:
            print(str(new_profile[i].values.tolist()))

        
        # Indexing that new profile data       
        new_profile.index = [raw_df.index[-1] + 1]  

        # Stroting Clusetered Profile  into  Pickle datastore
        updateProfile = raw_df
        concat = pd.concat([updateProfile,new_profile])              
        concat.to_pickle('profiles.pkl')
        concat.to_csv('_new_profile.csv')   
        
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
        
        # Fitting the model
        svm.fit(X, y)
        # Classifying the new data 
        designated_cluster = svm.predict(new_vect_prof)
        # Narrowing down the dataset to only the designated cluster
        des_cluster = (cluster_df[cluster_df['Cluster #']== designated_cluster[0]])
        
        
        # Appending the new profile data
        des_cluster = des_cluster.append(new_profile, sort=False)
              
        newClusterNumber = int(des_cluster['Cluster #'].values[0])      

        new_profile.loc[raw_df.index[-1] + 1, 'Cluster #'] = newClusterNumber
        
        print('Cluster No: ' + str(newClusterNumber))
        
        # Stroting Clusetered Profile  into  Pickle datastore
        concat = pd.concat([cluster_df,new_profile])    
        concat.to_csv('clustered_profiles.csv')
        concat.to_pickle('clustered_profiles.pkl')
        
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
        
        print("\nThe User id is : " + str(user_n))
        
        print(top_10_sim)
        
        return  " __  UserId:"  + str(top_10_sim) + "\n" 
    else:
        return 'no data'



@app.route('/reccomendProfiles', methods=['POST'])
def reccomendProfiles():

    # Loading in the original unclustered DF
    with open("profiles.pkl",'rb') as fp:
        raw_df = pickle.load(fp)
    
    # Loading in the clustered DF
    with open("clustered_profiles.pkl",'rb') as fp:
        cluster_df = pickle.load(fp)
    
    
    
    # Instantiating a new DF row to append later
    new_profile = pd.DataFrame(columns=raw_df.columns)

    
    data =  request.get_json()

    if request.json:

        print('\n<---NEW REQUEST---->\n')
        
        # assign web api data here
        new_profile['Bios'] = [data['bio']]  
        new_profile['Movies'] = [data['scoreList'][0]] 
        new_profile['TV'] = [data['scoreList'][1]]
        new_profile['Religion'] = [data['scoreList'][2]]
        new_profile['Music'] = [data['scoreList'][3]]
        new_profile['Sports'] = [data['scoreList'][4]]
        new_profile['Books'] = [data['scoreList'][5]]
        new_profile['Politics'] = [data['scoreList'][6]]
        
        for i in new_profile.columns[0:]:
            print(str(new_profile[i].values.tolist()))

        
        # Indexing that new profile data       
        new_profile.index = [raw_df.index[-1] + 1]  

        # Stroting Clusetered Profile  into  Pickle datastore
        updateProfile = raw_df
        concat = pd.concat([updateProfile,new_profile])              
        # concat.to_pickle('profiles.pkl')
        # concat.to_csv('_new_profile.csv')   
        
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
        
        # Fitting the model
        svm.fit(X, y)
        # Classifying the new data 
        designated_cluster = svm.predict(new_vect_prof)
        # Narrowing down the dataset to only the designated cluster
        des_cluster = (cluster_df[cluster_df['Cluster #']== designated_cluster[0]])
        
        
        # Appending the new profile data
        des_cluster = des_cluster.append(new_profile, sort=False)
              
        newClusterNumber = int(des_cluster['Cluster #'].values[0])      

        new_profile.loc[raw_df.index[-1] + 1, 'Cluster #'] = newClusterNumber
        
        print('Cluster No: ' + str(newClusterNumber))
        
        # Stroting Clusetered Profile  into  Pickle datastore
        concat = pd.concat([cluster_df,new_profile])    
              
        # Fitting the vectorizer to the Bios
        cluster_x = vectorizer.fit_transform(des_cluster['Bios'])
        
        # Creating a new DF that contains the vectorized words
        cluster_v = pd.DataFrame(cluster_x.toarray(), index=des_cluster.index, columns=vectorizer.get_feature_names())
        
        # Joining the Vectorized DF to the previous DF and dropping columns
        des_cluster = des_cluster.join(cluster_v).drop(['Bios', 'Cluster #'], axis=1)
        
        print('tesla')
        ## Correlations
        # Trasnposing the DF so that we are correlating with the index(users) and finding the correlation
        corr = des_cluster.T.corr()
        
        # Finding the Top 10 similar or correlated users to the new user.
        user_n = new_profile.index[0]
        
        # Creating a DF with the Top 10 most similar profiles
        top_10_sim = corr[[user_n]].sort_values(by=[user_n],axis=0, ascending=False)[1:11]
        
        # Finally locating the Top 10 profiles
        raw_df.loc[top_10_sim.index]
        
        # print("\nThe User id is : " + str(user_n))
     
        print(top_10_sim)
        
        return  str(top_10_sim) + "\n" 
    else:
        return 'no data'





if(__name__ == "__main__"):
    app.run()
    
