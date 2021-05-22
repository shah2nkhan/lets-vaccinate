# lets-vaccinate -  App that writes to telegram Channels using Bot api on Weekly vaccine availability of Dose 1 of Delhi 18 Years and Pune all age group dose 1.

Tool writes to Telegram channel/s every minute vaccine availabiliy. Additionally does the console.log
- Delhi NCR district inludes Faridabad, Gurgaon, GautamBudh Nagar, Gazipur, Ghaziabad (18 Years Dose 1) 
- Pune District all age group dose 1.

**Sample response :**
```
Status Time = 5/22/2021, 12:00:42 PM  **<!-- Time at which system pulled the data -->**
District = Ghaziabad **<!--Helps to easly find on Cowin App for bookig-->**
Name = Max Hospital Vaishali-1
Address = W-3  Sector-1 Vaishali Ghaziabad **<!--Some Hospital mentions Pincode that help for quick search for booking-->*
Fee = 900 **<!-- Free or Cost of vaccine -->**
Session 1:
 Date = 26-05-2021 
 Available Slots = 14 
 Vaccine = COVISHIELD
```

## How to book vaccine
- Go to https://www.cowin.gov.in/
- Login using Otp or arogya setu
- Search by Pincode if notification address has pincode otherwise Search by district of a state as mentioned in Alert  
- Voila Have safe vaccine booking!!
- Sometime cowin App doesnot show the same detail as we are pulling after 1 min in my experience that too much time for even loosing the center but cant help

## Things to note

Due to possible race condition at Cowin service side when you see 1 (few) available slot main cowin web may not show you that, even if Cowin web shows you that it may not allow you to book. Thats in general issue with Cowin Api all together.
Thats why we have putted minimum capped of 5 vaccines per center

## Tools required

- Any editor (VS code)
- Git
- Node - latest

## First time setup
- Create a Json file under data named
 **telegram.json**  with content structure as follows:

  {
      "DelhiChatId": "<-chatID->",
      "PuneChatId": "<-chatID->",
      "API_TOKEN": "bot<-botToken->"
  }

## Usage

```bash
npm ci
```
or
```bash
npm ci
```

## Usage

```bash
npm start
```
