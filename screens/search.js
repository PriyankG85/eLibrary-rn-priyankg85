import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { ListItem, Icon } from "react-native-elements";
import db from "../config";

export default function search() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [lastVisibleTrans, setLastVisibleTrans] = useState(null);
  const [searchedTrans, setSearchedTrans] = useState("");
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    getTransactions();
  }, []);

  const getTransactions = async () => {
    const allTrans = [];
    const q = query(collection(db, "transactions"), limit(10));
    const transRef = await getDocs(q).then((doc) => {
      doc.forEach((data) => {
        allTrans.push(data.data());
      });
    });
    setAllTransactions([allTrans]);
    setLastVisibleTrans(allTrans[allTrans.length - 1]);
    setIsFetched(true);
  };

  const fetchMoreTrans = async () => {
    const trans = [];
    const q = query(
      collection(db, "transactions"),
      orderBy("Date"),
      startAfter(lastVisibleTrans),
      limit(10)
    );

    const transRef = await getDocs(q).then((doc) => {
      doc.forEach((data) => {
        trans.push(data.data());
      });
    });
    setAllTransactions([...allTransactions, trans]);
  };

  const handleSearch = async () => {
    // First fetch all the Transactions from db and store them in an array!!

    const allTrans = [];

    const allTransRef = await getDocs(collection(db, "transactions")).then(
      (doc) => {
        doc.forEach((data) => {
          allTrans.push(data.data());
        });
      }
    );

    // Check the matched Fields and store them in a variable!!

    var matchedField = [];

    allTrans.forEach((data) => {
      if (
        // data.Book_id.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
        data.Book_id.toLowerCase() === searchText.toLowerCase()
      ) {
        matchedField.indexOf("Book_id") === -1 && matchedField.push("Book_id");
      }

      if (
        // data.Book_name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
        data.Book_name.toLowerCase() === searchText.toLowerCase()
      ) {
        matchedField.indexOf("Book_name") === -1 &&
          matchedField.push("Book_name");
      }

      if (
        // data.Student_Id.toLowerCase().indexOf(searchText.toLowerCase()) !==
        //   -1 ||
        data.Student_Id.toLowerCase() === searchText.toLowerCase()
      ) {
        matchedField.indexOf("Student_Id") === -1 &&
          matchedField.push("Student_Id");
      }

      if (
        // data.Student_name.toLowerCase().indexOf(searchText.toLowerCase()) !==
        //   -1 ||
        data.Student_name.toLowerCase() === searchText.toLowerCase()
      ) {
        matchedField.indexOf("Student_name") === -1 &&
          matchedField.push("Student_name");
      }

      if (
        // data.Transaction_type.toLowerCase().indexOf(
        //   searchText.toLowerCase()
        // ) !== -1 ||
        data.Transaction_type.toLowerCase() === searchText.toLowerCase()
      ) {
        matchedField.indexOf("Transaction_type") === -1 &&
          matchedField.push("Transaction_type");
      }
    });

    // After that fetch the transactions who matches with the searchText!!

    if (matchedField.length !== 0) {
      var queries = [];

      matchedField.forEach((d) => {
        var q1 = query(
          collection(db, "transactions"),
          where(d, "==", searchText),
          limit(10)
        );

        var q2 = query(
          collection(db, "transactions"),
          where(d, "==", searchText.toLowerCase()),
          limit(10)
        );

        var q3 = query(
          collection(db, "transactions"),
          where(d, "==", searchText[0].toUpperCase() + searchText.slice(1)),
          limit(10)
        );

        var q4 = query(
          collection(db, "transactions"),
          where(d, "==", searchText.toUpperCase()),
          limit(10)
        );

        queries.push(q1, q2, q3, q4);
      });

      const handleQueries = () => {
        queries.forEach(async (q) => {
          var transactions = [];

          await getDocs(q).then((doc) => {
            doc.forEach((data) => {
              transactions.push(data.data());
              searchedTrans !== transactions &&
                setSearchedTrans([transactions]);
            });
          });
        });
      };

      handleQueries();

      // if (queries.length !== 0) setSearchedTrans(transactions);
    } else setSearchedTrans("not_found");
  };

  const renderItem = ({ item, i }) => {
    const date = item.Date.toDate()
      .toString()
      .split(" ")
      .splice(0, 4)
      .join(" ");

    const transactionType =
      item.Transaction_type === "issue" ? "issued" : "returned";
    return (
      <View style={{ borderWidth: 1 }}>
        <ListItem
          key={i}
          containerStyle={{
            backgroundColor: "rgba(250, 230, 240, 0.8)",
            justifyContent: "center",
          }}
          bottomDivider
        >
          <Icon type={"antdesign"} name={"book"} size={40} />
          <ListItem.Content>
            <ListItem.Title style={styles.title}>
              {`${item.Book_name} ( ${item.Book_id} )`}
            </ListItem.Title>
            <ListItem.Subtitle style={styles.subtitle}>
              {`This book ${transactionType} by ${item.Student_name}`}
            </ListItem.Subtitle>
            <View style={styles.lowerLeftContaiiner}>
              <View style={styles.transactionRight}>
                <Text
                  style={[
                    styles.transactionText,
                    {
                      color:
                        item.Transaction_type === "issue"
                          ? "#78D304"
                          : "#0364F4",
                    },
                  ]}
                >
                  {item.Transaction_type.charAt(0).toUpperCase() +
                    item.Transaction_type.slice(1)}
                </Text>
                <Icon
                  type={"ionicon"}
                  name={
                    item.Transaction_type === "issue"
                      ? "checkmark-circle-outline"
                      : "arrow-redo-circle-outline"
                  }
                  color={
                    item.Transaction_type === "issue" ? "#78D304" : "#0364F4"
                  }
                />
              </View>
              <Text style={styles.date}>{date}</Text>
            </View>
          </ListItem.Content>
        </ListItem>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {(typeof searchedTrans === "object" ||
          searchedTrans === "not_found") && (
          <TouchableOpacity
            onPress={() => {
              setSearchedTrans("");
              setSearchText("");
            }}
            style={{ paddingRight: 10 }}
          >
            <Icon
              type="font-awesome-5"
              name="arrow-left"
              color="white"
              size={20}
            />
          </TouchableOpacity>
        )}
        <View style={styles.inputCont}>
          <TextInput
            style={styles.input}
            value={searchText}
            placeholder={"Search here"}
            placeholderTextColor={"rgba(250, 250, 250, 0.7)"}
            onChangeText={(e) => setSearchText(e)}
            onEndEditing={() => searchText.length !== 0 && handleSearch()}
          />
          <TouchableOpacity
            disabled={searchText.length === 0 ? true : false}
            onPress={() => searchText.length !== 0 && handleSearch()}
            style={styles.searchIconCont}
          >
            <Icon name="search" color={"white"} size={20} />
          </TouchableOpacity>
        </View>
      </View>
      {searchedTrans === "not_found" && (
        <Text
          style={{
            fontSize: 22,
            marginTop: 20,
            fontWeight: 500,
            color: "#efefef",
            textAlign: "center",
          }}
        >
          No Transactions found!!
        </Text>
      )}
      {typeof searchedTrans !== "string" && (
        <View style={styles.searchedTrans}>
          <FlatList
            data={searchedTrans[0]}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      )}
      {!isFetched ? (
        <View
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            display: searchedTrans !== "" ? "none" : "flex",
          }}
        >
          <Text
            style={{
              fontSize: 22,
              color: "#efefef",
              fontWeight: "bold",
            }}
          >
            Loading...
          </Text>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            width: "100%",
            backgroundColor: "rgba(50, 55, 55, 0.7)",
            display: searchedTrans !== "" ? "none" : "flex",
          }}
        >
          {allTransactions.length === 0 ? (
            <Text
              style={{
                fontSize: 22,
                marginTop: 20,
                fontWeight: 500,
                color: "#efefef",
                textAlign: "center",
              }}
            >
              No Transactions found!!
            </Text>
          ) : (
            <FlatList
              data={allTransactions[0]}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={() => fetchMoreTrans()}
              onEndReachedThreshold={0.9}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(80, 80, 40, 0.7)",
  },
  searchContainer: {
    padding: 10,
    width: "100%",
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5653D4",
  },
  inputCont: {
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
    flexDirection: "row",
    borderColor: "#efefef",
  },
  input: {
    padding: 5,
    flexGrow: 1,
    fontSize: 18,
    marginRight: 10,
    color: "#efefef",
    textAlign: "center",
  },
  searchIconCont: {
    right: 0,
    padding: 8,
    zIndex: 10,
    position: "absolute",
    width: "max-content",
  },
  title: {
    fontSize: 18,
    fontFamily: "Rajdhani_600SemiBold",
  },
  subtitle: {
    fontSize: 16,
    maxWidth: "70%",
    fontFamily: "Rajdhani_600SemiBold",
  },
  lowerLeftContaiiner: {
    alignSelf: "flex-end",
    marginTop: -40,
  },
  transactionRight: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  transactionText: {
    fontSize: 20,
    fontFamily: "Rajdhani_600SemiBold",
  },
  date: {
    fontSize: 12,
    fontFamily: "Rajdhani_600SemiBold",
    paddingTop: 5,
  },
  searchedTrans: {
    flex: 1,
    width: "100%",
    backgroundColor: "rgba(50, 55, 55, 0.7)",
  },
});
