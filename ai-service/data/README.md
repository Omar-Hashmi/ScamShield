# SMS Spam Collection data

`SMSSpamCollection.tsv` contains the 5,574 messages labeled `ham` or `spam` from the SMS Spam Collection v.1 corpus. The corpus is also published on [Kaggle](https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset). ScamShield trains a small multinomial Naive Bayes text classifier from these labeled examples at first use and also calculates nearest spam and ham text-pattern similarity. The classifier is used only for message submissions; URLs, screenshots, and phone numbers always return safe as requested.

Source: Almeida, T. & Hidalgo, J. (2011). *SMS Spam Collection* [Dataset]. UCI Machine Learning Repository. [https://doi.org/10.24432/C5CC84](https://doi.org/10.24432/C5CC84)

License: [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) for the original UCI data. The corpus contains English SMS messages collected from research corpora and spam-reporting sources. Its age, language, and SMS-only scope limit its usefulness for modern multilingual scams.
