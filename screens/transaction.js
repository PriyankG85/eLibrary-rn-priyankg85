import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  TextInput,
  StyleSheet,
  ToastAndroid,
  ImageBackground,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
const bgImage = require("../images/bgImg.jpg");
const appIcon = require("../images/appIcon.png");
const appName = require("../images/appName.png");
import {
  doc,
  getDoc,
  increment,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import db from "../config";
import { t } from "react-native-tailwindcss";

export default class Transaction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false,
      bookId: "",
      studentId: "",
      bookName: "",
      studentName: "",
    };
  }

  getCameraPermissions = async (domState) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
      hasCameraPermissions: status === "granted",
      domState: domState,
      scanned: false,
    });
  };

  getBookDetails = async (bookId) => {
    await getDoc(doc(db, "Books", bookId)).then((doc) => {
      this.setState({ bookName: doc.data().Book_Details.Book_Name });
      // console.log(this.state.bookName);
    });
  };

  getStudentDetails = async (studentId) => {
    await getDoc(doc(db, "Students", studentId)).then((doc) => {
      if (doc.data()) {
        this.setState({ studentName: doc.data().Student_Details.Student_Name });
        // console.log(this.state.studentName);
      }
    });
  };

  handleTransaction = async () => {
    var { bookId, studentId } = this.state;

    const transactionType = await this.checkDbAvailability(bookId);

    if (transactionType !== false) {
      await this.getBookDetails(bookId);
      await this.getStudentDetails(studentId);
    }

    this.setState({
      bookId: "",
      studentId: "",
    });
  };

  initiateBookIssue = async (bookId, studentId, bookName, studentName) => {
    // Add Transaction!!
    await setDoc(doc(db, "transactions", `${Date.now()}`), {
      Student_Id: studentId,
      Student_name: studentName,
      Book_id: bookId,
      Book_name: bookName,
      Date: Timestamp.now().toDate(),
      Transaction_type: "issue",
    });
    // Add Change Book Status to false!!
    await updateDoc(doc(db, "Books", bookId), {
      isBookAvailable: false,
    });
    // Add Change the Number of issued books to the student (+1)!!
    await setDoc(
      doc(db, "Students", studentId),
      {
        NumberOfBookIssued: increment(+1),
      },
      { merge: true }
    );
    // ToastAndroid.show("Book issued successfully!!", ToastAndroid.SHORT);
  };

  initiateBookReturn = async (bookId, studentId, bookName, studentName) => {
    // Add Transaction!!
    await setDoc(doc(db, "transactions", `${Date.now()}`), {
      Student_Id: studentId,
      Student_name: studentName,
      Book_id: bookId,
      Book_name: bookName,
      Date: Timestamp.now().toDate(),
      Transaction_type: "return",
    });
    // Add Change Book Status to true!!
    await updateDoc(doc(db, "Books", bookId), {
      isBookAvailable: true,
    });
    // Add Change the Number of issued books to the student (-1)!!
    await setDoc(
      doc(db, "Students", studentId),
      {
        NumberOfBookIssued: increment(-1),
      },
      { merge: true }
    );
    // ToastAndroid.show("Book returned to the library!", ToastAndroid.SHORT);
  };

  handleBarCodeScanned = async ({ type, data }) => {
    var { domState } = this.state;

    if (domState === "bookId") {
      this.setState({
        bookId: data,
        domState: "normal",
        scanned: true,
      });
    } else if (domState === "studentId") {
      this.setState({
        studentId: data,
        domState: "normal",
        scanned: true,
      });
    }
  };

  checkDbAvailability = async (bookId, studentId) => {
    var { bookId, studentId, bookName, studentName } = this.state;

    // var bookDetails;
    var transactionType;
    const dbBooksRef = await getDoc(doc(db, "Books", bookId)).then((doc) => {
      if (!doc.data()) {
        transactionType = false;
      } else if (doc.data().isBookAvailable) {
        transactionType = "issue";
      } else {
        transactionType = "return";
      }
    });

    if (!transactionType) {
      alert("Book doesn't exists!!");
    }

    const dbStdRef = await getDoc(doc(db, "Students", studentId)).then(
      (doc) => {
        if (doc.data()) {
          if (doc.data().NumberOfBookIssued < 2) {
            if (transactionType === "issue") {
              this.initiateBookIssue(bookId, studentId, bookName, studentName),
                alert("Book issued successfully!");
            } else if (transactionType === "return") {
              this.initiateBookReturn(bookId, studentId, bookName, studentName);
              alert("Book retured to the library!");
            }
          } else if (
            doc.data().NumberOfBookIssued >= 2 &&
            transactionType === "return"
          ) {
            this.initiateBookReturn(bookId, studentId, bookName, studentName);
            alert("Book retured to the library!");
          }
        } else if (
          doc.data() &&
          doc.data().NumberOfBookIssued >= 2 &&
          transactionType === "issue"
        ) {
          alert("You have already issued 2 books no more allowed!!");
        } else if (!doc.data() && transactionType)
          alert("Student doesn't exists!!");
      }
    );

    if (transactionType !== undefined) {
      return transactionType;
    }
  };

  render() {
    const { domState, bookId, studentId, scanned } = this.state;
    if (domState !== "normal") {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? {} : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    return (
      <KeyboardAvoidingView position="fixed" style={styles.body}>
        <ImageBackground source={bgImage} style={styles.bgImage}>
          <View style={styles.container}>
            <View style={styles.upperContainer}>
              <Image source={appIcon} style={styles.appIcon} />
              <Text style={[t.pT5, t.text2xl, t.textWhite, t.fontBold]}>
                Hi{" "}
                {this.props.route.params.email[0]?.toUpperCase() +
                  this.props.route.params.email?.slice(
                    1,
                    this.props.route.params.email.indexOf("@")
                  )}
              </Text>
            </View>
            <View style={styles.lowerContainer}>
              <View style={styles.textinputContainer}>
                <TextInput
                  style={styles.textinput}
                  onChangeText={(e) => {
                    this.setState({ bookId: e });
                  }}
                  placeholder={"Book Id"}
                  placeholderTextColor={"rgba(255, 255, 255, 0.6)"}
                  value={bookId}
                />
                <TouchableOpacity
                  style={styles.scanbutton}
                  onPress={() => this.getCameraPermissions("bookId")}
                >
                  <Text style={styles.scanbuttonText}>Scan</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.textinputContainer, { marginTop: 25 }]}>
                <TextInput
                  style={styles.textinput}
                  onChangeText={(e) => {
                    this.setState({ studentId: e });
                  }}
                  placeholder={"Student Id"}
                  placeholderTextColor={"rgba(255, 255, 255, 0.6)"}
                  value={studentId}
                />
                <TouchableOpacity
                  style={styles.scanbutton}
                  onPress={() => this.getCameraPermissions("studentId")}
                >
                  <Text style={styles.scanbuttonText}>Scan</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                disabled={
                  this.state.bookId.length === 0 ||
                  this.state.studentId.length === 0
                    ? true
                    : false
                }
                onPress={() =>
                  this.state.bookId.length === 0 ||
                  this.state.studentId.length === 0
                    ? undefined
                    : this.handleTransaction()
                }
                style={styles.submitBtn}
              >
                <Text style={styles.submitBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(50, 50, 50, 0.7)",
  },
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    // backgroundColor: 'rgba(50, 50, 50, 0.8)'
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginTop: 80,
  },
  appName: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: "center",
  },
  textinputContainer: {
    marginTop: 40,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#84DFFF",
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#84DFFF",
    borderRadius: 10,
    borderWidth: 2,
    fontSize: 18,
    backgroundColor: "#5653D4",
    fontFamily: "Rajdhani_600SemiBold",
    color: "#FFFFFF",
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: "#84DFFF",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  scanbuttonText: {
    fontSize: 24,
    color: "#0A0101",
    fontFamily: "Rajdhani_600SemiBold",
  },
  submitBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderColor: "#121212",
    backgroundColor: "rgba(80, 80, 80, 0.8)",
  },
  submitBtnText: {
    fontSize: 20,
    color: "#EDD2F3",
    fontWeight: "bold",
  },
});
