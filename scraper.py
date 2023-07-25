import requests
from bs4 import BeautifulSoup


def fetch_coingecko_html(page):
    # make a request to the target website
    HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36', 'Referer': 'https://www.coingecko.com/'}

    r = requests.get(page, headers=HEADERS)
    if r.status_code == 200:
        # if the request is successful return the HTML content
        return r.text
    else:
        print(r.status_code)
        # throw an exception if an error occurred
        print("an error occurred while fetching coingecko html")
        return None

def extract_crypto_info(html):
    # parse the HTML content with Beautiful Soup
    soup = BeautifulSoup(html, "html.parser")

    # find all the cryptocurrency elements
    coin_table = soup.find("div", {"class": "coin-table"})
    crypto_elements = coin_table.find_all("tr")[1:]

    # iterate through our cryptocurrency elements
    cryptos = []
    for crypto in crypto_elements:
        # extract the information needed using our observations
        cryptos.append({
            "name": crypto.find("td", {"class": "coin-name"})["data-sort"],
            "url": crypto.find("a", {"class": "tw-flex"})["href"],
            "price": crypto.find("td", {"class": "td-price"}).text.strip(),
            "change_1h": crypto.find("td", {"class": "td-change1h"}).text.strip(),
            "change_24h": crypto.find("td", {"class": "td-change24h"}).text.strip(),
            "volume": crypto.find("td", {"class": "td-liquidity_score"}).text.strip()
        })

    return cryptos


def extract_discord_link(html):
    # parse the HTML content with Beautiful Soup
    soup = BeautifulSoup(html, "html.parser")

    # find all the cryptocurrency elements
    links = soup.find_all("div", {"class": "coin-link-row"})
    for link in links:
        a_links = link.find_all("a")
        for a_link in a_links:
            if "discord" in a_link["href"]:
                print(a_link["href"])


# fetch CoinGecko's HTML content
# CHANGE THIS AROUND TO PARSE WHATEVER PAGE WE WANT
html = fetch_coingecko_html("https://www.coingecko.com/en/new-cryptocurrencies?page=5")

# extract our data from the HTML document
cryptos = extract_crypto_info(html)

# display the scraper results
for crypto in cryptos:
    #print(crypto["name"], "\n")
    coin_html = fetch_coingecko_html("https://www.coingecko.com/" + crypto["url"])
    #coin_html = fetch_coingecko_html("https://www.coingecko.com/en/coins/ethereum")
    # print(coin_html)
    if coin_html is not None:
        extract_discord_link(coin_html)
