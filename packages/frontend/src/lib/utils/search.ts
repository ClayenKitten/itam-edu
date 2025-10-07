export function search<T extends Searchable>(query: string, options: T[]): T[] {
    let searchWords = query.trim().toLowerCase().split(" ");
    return options.filter(item =>
        searchWords.every(searchWord => {
            const match = (s: string) => s.toLowerCase().includes(searchWord);
            if ("title" in item && match(item.title)) return true;
            if ("tgUsername" in item) {
                if (match("@" + item.tgUsername)) return true;
                if (match(item.firstName)) return true;
                if (item.lastName && match(item.lastName)) return true;
            }
            return false;
        })
    );
}

export type Searchable =
    | {
          title: string;
      }
    | {
          firstName: string;
          lastName: string | null;
          tgUsername: string;
      };
