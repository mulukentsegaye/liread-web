import urllib.request
import urllib.parse
import json
import time

books = [
    ("The Creative Act: A Way of Being", "Rick Rubin"),
    ("Atomic Habits", "James Clear"),
    ("Meditations", "Marcus Aurelius"),
    ("Deep Work", "Cal Newport"),
    ("Dune", "Frank Herbert"),
    ("Before the Coffee Gets Cold", "Toshikazu Kawaguchi"),
    ("Thinking, Fast and Slow", "Daniel Kahneman"),
    ("Sapiens: A Brief History of Humankind", "Yuval Noah Harari"),
    ("Man's Search for Meaning", "Viktor E. Frankl"),
    ("Show Your Work!", "Austin Kleon"),
    ("Walden", "Henry David Thoreau"),
    ("1984", "George Orwell"),
    ("To the Lighthouse", "Virginia Woolf"),
    ("Fahrenheit 451", "Ray Bradbury"),
    ("War and Peace", "Leo Tolstoy"),
    ("Exhalation", "Ted Chiang")
]

results = []

for title, author in books:
    query = urllib.parse.urlencode({'q': f"{title} {author}", 'limit': 3})
    url = f"https://openlibrary.org/search.json?{query}"
    req = urllib.request.Request(url, headers={'User-Agent': 'ReadersHubAudit/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            docs = data.get('docs', [])
            if docs:
                best = docs[0]
                results.append({
                    'query_title': title,
                    'query_author': author,
                    'found_title': best.get('title'),
                    'found_author': best.get('author_name', ['Unknown'])[0],
                    'cover_i': best.get('cover_i'),
                    'work_key': best.get('key'),
                    'first_publish_year': best.get('first_publish_year')
                })
                print(f"OK: {title} -> {best.get('title')} by {best.get('author_name', [''])[0]} | cover_i={best.get('cover_i')} | work={best.get('key')}")
            else:
                print(f"NOT FOUND: {title}")
    except Exception as e:
        print(f"ERROR: {title}: {e}")
    time.sleep(0.3)

with open('scripts/book_audit_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)
print("Done. Saved to scripts/book_audit_results.json")
