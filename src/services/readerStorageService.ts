import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { StoredBook, Bookmark, Highlight } from '../types/reader';

interface ReaderDBSchema extends DBSchema {
  books: {
    key: string;
    value: StoredBook;
    indexes: {
      'by-lastRead': number;
      'by-status': string;
    };
  };
}

const DB_NAME = 'readers_hub_ereader_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ReaderDBSchema>> | null = null;

function getDB(): Promise<IDBPDatabase<ReaderDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<ReaderDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('books')) {
          const store = db.createObjectStore('books', { keyPath: 'id' });
          store.createIndex('by-lastRead', 'lastReadTimestamp');
          store.createIndex('by-status', 'readingStatus');
        }
      },
    });
  }
  return dbPromise;
}

export const readerStorageService = {
  async saveBook(book: StoredBook): Promise<void> {
    const db = await getDB();
    await db.put('books', book);
  },

  async getBook(id: string): Promise<StoredBook | undefined> {
    const db = await getDB();
    return db.get('books', id);
  },

  async getAllBooks(): Promise<StoredBook[]> {
    const db = await getDB();
    const books = await db.getAllFromIndex('books', 'by-lastRead');
    // Return descending (most recently read first)
    return books.reverse();
  },

  async updateBookProgress(
    id: string,
    updates: {
      currentPage: number;
      totalPages?: number;
      currentLocation?: string;
      progressPercent: number;
    }
  ): Promise<void> {
    const db = await getDB();
    const book = await db.get('books', id);
    if (!book) return;

    book.currentPage = updates.currentPage;
    if (updates.totalPages !== undefined) book.totalPages = updates.totalPages;
    if (updates.currentLocation !== undefined) book.currentLocation = updates.currentLocation;
    book.progressPercent = Math.max(0, Math.min(100, Math.round(updates.progressPercent)));
    book.lastReadTimestamp = Date.now();

    if (book.progressPercent >= 100) {
      book.readingStatus = 'have_read';
    } else {
      book.readingStatus = 'reading_now';
    }

    await db.put('books', book);
  },

  async toggleFavorite(id: string): Promise<boolean> {
    const db = await getDB();
    const book = await db.get('books', id);
    if (!book) return false;
    book.isFavorite = !book.isFavorite;
    await db.put('books', book);
    return book.isFavorite;
  },

  async addBookmark(bookId: string, bookmark: Bookmark): Promise<void> {
    const db = await getDB();
    const book = await db.get('books', bookId);
    if (!book) return;
    book.bookmarks = [...(book.bookmarks || []), bookmark];
    await db.put('books', book);
  },

  async removeBookmark(bookId: string, bookmarkId: string): Promise<void> {
    const db = await getDB();
    const book = await db.get('books', bookId);
    if (!book) return;
    book.bookmarks = (book.bookmarks || []).filter((b) => b.id !== bookmarkId);
    await db.put('books', book);
  },

  async addHighlight(bookId: string, highlight: Highlight): Promise<void> {
    const db = await getDB();
    const book = await db.get('books', bookId);
    if (!book) return;
    book.highlights = [...(book.highlights || []), highlight];
    await db.put('books', book);
  },

  async removeHighlight(bookId: string, highlightId: string): Promise<void> {
    const db = await getDB();
    const book = await db.get('books', bookId);
    if (!book) return;
    book.highlights = (book.highlights || []).filter((h) => h.id !== highlightId);
    await db.put('books', book);
  },

  async deleteBook(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('books', id);
  },

  /**
   * Seed classic public domain sample books if IndexedDB is currently empty
   * so the user can immediately experience the reader without uploading first.
   */
  async seedSampleBooksIfEmpty(): Promise<StoredBook[]> {
    const existing = await this.getAllBooks();
    if (existing.length > 0) return existing;

    const sampleMeditations: StoredBook = {
      id: 'sample-meditations',
      title: 'Meditations (Selected Chapters)',
      author: 'Marcus Aurelius',
      format: 'txt',
      fileBlob: new Blob([SAMPLE_MEDITATIONS_TEXT], { type: 'text/plain' }),
      fileSize: SAMPLE_MEDITATIONS_TEXT.length,
      coverUrl: 'https://covers.openlibrary.org/b/id/12818862-L.jpg',
      totalPages: 12,
      currentPage: 1,
      progressPercent: 0,
      lastReadTimestamp: Date.now(),
      createdAt: Date.now(),
      isFavorite: true,
      readingStatus: 'reading_now',
      bookmarks: [],
      highlights: [],
    };

    const sampleArtOfWar: StoredBook = {
      id: 'sample-art-of-war',
      title: 'The Art of War',
      author: 'Sun Tzu',
      format: 'txt',
      fileBlob: new Blob([SAMPLE_ART_OF_WAR_TEXT], { type: 'text/plain' }),
      fileSize: SAMPLE_ART_OF_WAR_TEXT.length,
      coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
      totalPages: 8,
      currentPage: 1,
      progressPercent: 0,
      lastReadTimestamp: Date.now() - 3600000,
      createdAt: Date.now() - 3600000,
      isFavorite: false,
      readingStatus: 'to_read',
      bookmarks: [],
      highlights: [],
    };

    await this.saveBook(sampleMeditations);
    await this.saveBook(sampleArtOfWar);

    return [sampleMeditations, sampleArtOfWar];
  },
};

const SAMPLE_MEDITATIONS_TEXT = `MEDITATIONS
by Marcus Aurelius
Translated by George Long

BOOK ONE

1. From my grandfather Verus I learned good morals and the government of my temper.
2. From the reputation and remembrance of my father, modesty and a manly character.
3. From my mother, piety and beneficence, and abstinence, not only from evil deeds, but even from evil thoughts; and further, simplicity in my way of living, far removed from the habits of the rich.
4. From my great-grandfather, not to have frequented public schools, and to have had good teachers at home, and to know that on such things a man ought to spend liberally.

BOOK TWO

When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. They are like this because they cannot distinguish good from evil. But I have seen the beauty of good, and the ugliness of evil, and have recognized that the wrongdoer has a nature related to my own—not of the same blood or birth, but the same mind, and possessing a share of the divine.

And so none of them can hurt me. No one can implicate me in ugliness. Nor can I feel angry at my fellow human, nor hate him. We were made to collaborate like feet, like hands, like the rows of the upper and lower teeth. To work against one another is therefore contrary to nature; and to be angry with another person and turn away from him is surely to work against him.

Remember how long you have been deferring these things, and how often you have had an opportunity from the gods, and yet have not used it. You must now at last perceive of what universe you are a part, and of what administrator of the universe your existence is an efflux, and that a limit of time is fixed for you, which if you do not use for clearing away the clouds from your mind, it will go and you will go, and it will never return.

Every moment think steadily as a Roman and a human to do what you have in hand with perfect and simple dignity, and feeling of affection, and freedom, and justice; and to give yourself relief from all other thoughts. And you will give yourself relief, if you do every act of your life as if it were the last.

BOOK FOUR

Men seek retreats for themselves, houses in the country, sea-shores, and mountains; and thou too art wont to desire such things very much. But this is altogether a mark of the most common sort of men, for it is in thy power whenever thou shalt choose to retire into thyself. For nowhere either with more quiet or more freedom from trouble does a man retire than into his own soul, particularly when he has within him such thoughts that by looking into them he is immediately in perfect tranquility.
Constantly then give to thyself this retreat, and renew thyself; and let thy rules be short and fundamental, which as soon as thou hast thought of them will remove all vexation.

What is it that will vex thee? The badness of men? Reflect on the reasoning that rational animals are made for one another, and that forbearance is a part of justice, and that men do wrong involuntarily. Consider how many already, after mutual enmity, suspicion, hatred, and fighting, have been stretched dead, reduced to ashes; and be quiet at last.

Time is a river, a fierce torrent of events; no sooner is a thing brought to sight than it is swept away and another takes its place, and this too will be swept away. Everything which happens is as familiar and well known as the rose in spring and the grape in summer; for such is disease, and death, and calumny, and treachery, and whatever else delights fools or vexes them.
`;

const SAMPLE_ART_OF_WAR_TEXT = `THE ART OF WAR
by Sun Tzu
Translated by Lionel Giles

CHAPTER I: LAYING PLANS

1. Sun Tzu said: The art of war is of vital importance to the State.
2. It is a matter of life and death, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected.
3. The moral law causes the people to be in complete accord with their ruler, so that they will follow him regardless of their lives, undismayed by any danger.
4. Heaven signifies night and day, cold and heat, times and seasons. Earth comprises distances, great and small; danger and security; open ground and narrow passes; the chances of life and death.
5. The Commander stands for the virtues of wisdom, sincerity, benevolence, strictness and courage.
6. By method and discipline are to be understood the marshaling of the army in its proper subdivisions, the graduations of rank among the officers, the maintenance of roads by which supplies may reach the army, and the control of military expenditure.
7. These five heads should be familiar to every general: he who knows them will be victorious; he who knows them not will fail.

CHAPTER II: WAGING WAR

1. Sun Tzu said: In the operations of war, where there are in the field a thousand swift chariots, as many heavy chariots, and a hundred thousand mail-clad soldiers, with provisions enough to carry them a thousand li, the expenditure at home and at the front, including entertainment of guests, small items such as glue and paint, and sums spent on chariots and armor, will reach the total of a thousand ounces of silver per day. Such is the cost of raising an army of 100,000 men.
2. When you engage in actual fighting, if victory is long in coming, then men's weapons will grow dull and their ardor will be damped. If you lay siege to a town, you will exhaust your strength.
3. Again, if the campaign is protracted, the resources of the State will not be equal to the strain.
4. Now, when your weapons are dulled, your ardor damped, your strength exhausted and your treasure spent, other chieftains will spring up to take advantage of your extremity. Then no man, however wise, will be able to avert the consequences that must ensue.
5. Thus, though we have heard of stupid haste in war, cleverness has never been seen associated with long delays.
`;
