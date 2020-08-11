from flask import Flask, jsonify, request
from configurations import DevelopmentConfig

app = Flask(__name__)
app.config.from_object(DevelopmentConfig)

# @app.route('/')
# def welcomeMessage():
#     return "Python Webservice"

@app.route('/', methods=['POST'])
def showing():
    data =  request.get_json()
    return  jsonify(data)
        



# for item in range(10):
#     print(item)


# print('jack is back') 




if(__name__ == "__main__"):
    app.run(debug=True)
