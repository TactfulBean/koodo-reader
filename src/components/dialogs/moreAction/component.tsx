import React from "react";
import "./moreAction.css";
import { Trans } from "react-i18next";
import { MoreActionProps, MoreActionState } from "./interface";

import toast from "react-hot-toast";
import BookUtil from "../../../utils/file/bookUtil";
import {
  exportDictionaryHistory,
  exportHighlights,
  exportNotes,
} from "../../../utils/file/export";
import StorageUtil from "../../../utils/service/configService";
import NoteService from "../../../utils/service/noteService";
import WordService from "../../../utils/service/wordService";
declare var window: any;
class ActionDialog extends React.Component<MoreActionProps, MoreActionState> {
  constructor(props: MoreActionProps) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div
        className="action-dialog-container"
        onMouseLeave={() => {
          this.props.handleMoreAction(false);
          this.props.handleActionDialog(false);
        }}
        onMouseEnter={(event) => {
          this.props.handleMoreAction(true);
          this.props.handleActionDialog(true);
          event?.stopPropagation();
        }}
        style={
          this.props.isShowExport
            ? {
                position: "fixed",
                left: this.props.left + (this.props.isExceed ? -195 : 195),
                top: this.props.top + 70,
              }
            : { display: "none" }
        }
      >
        <div className="action-dialog-actions-container">
          <div
            className="action-dialog-edit"
            style={{ paddingLeft: "0px" }}
            onClick={() => {
              BookUtil.fetchBook(
                this.props.currentBook.key,
                this.props.currentBook.format.toLowerCase(),
                true,
                this.props.currentBook.path
              ).then((result: any) => {
                toast.success(this.props.t("Export successful"));
                window.saveAs(
                  new Blob([result]),
                  this.props.currentBook.name +
                    `.${this.props.currentBook.format.toLocaleLowerCase()}`
                );
              });
            }}
          >
            <p className="action-name">
              <Trans>Export books</Trans>
            </p>
          </div>
          <div
            className="action-dialog-edit"
            style={{ paddingLeft: "0px" }}
            onClick={async () => {
              let notes = await NoteService.getNotesByBookKey(
                this.props.currentBook.key
              );
              if (notes.length > 0) {
                exportNotes(notes, [
                  ...this.props.books,
                  ...this.props.deletedBooks,
                ]);
                toast.success(this.props.t("Export successful"));
              } else {
                toast(this.props.t("Nothing to export"));
              }
            }}
          >
            <p className="action-name">
              <Trans>Export notes</Trans>
            </p>
          </div>
          <div
            className="action-dialog-edit"
            style={{ paddingLeft: "0px" }}
            onClick={async () => {
              let highlights = await NoteService.getHighlightsByBookKey(
                this.props.currentBook.key
              );
              if (highlights.length > 0) {
                exportHighlights(highlights, [
                  ...this.props.books,
                  ...this.props.deletedBooks,
                ]);
                toast.success(this.props.t("Export successful"));
              } else {
                toast(this.props.t("Nothing to export"));
              }
            }}
          >
            <p className="action-name">
              <Trans>Export highlights</Trans>
            </p>
          </div>
          <div
            className="action-dialog-edit"
            style={{ paddingLeft: "0px" }}
            onClick={async () => {
              let dictHistory = await WordService.getWordsByBookKey(
                this.props.currentBook.key
              );
              if (dictHistory.length > 0) {
                exportDictionaryHistory(dictHistory, [
                  ...this.props.books,
                  ...this.props.deletedBooks,
                ]);
                toast.success(this.props.t("Export successful"));
              } else {
                toast(this.props.t("Nothing to export"));
              }
            }}
          >
            <p className="action-name">
              <Trans>Export dictionary history</Trans>
            </p>
          </div>
          <div
            className="action-dialog-edit"
            style={{ paddingLeft: "0px" }}
            onClick={() => {
              if (this.props.currentBook.format === "PDF") {
                toast(this.props.t("Not supported yet"));
                return;
              }
              toast(this.props.t("Pre-caching"));
              BookUtil.fetchBook(
                this.props.currentBook.key,
                this.props.currentBook.format.toLowerCase(),
                true,
                this.props.currentBook.path
              ).then(async (result: any) => {
                let rendition = BookUtil.getRendtion(
                  result,
                  this.props.currentBook.format,
                  "",
                  this.props.currentBook.charset,
                  StorageUtil.getReaderConfig("isSliding") === "yes"
                    ? "sliding"
                    : ""
                );
                let cache = await rendition.preCache(result);
                if (cache !== "err") {
                  BookUtil.addBook(
                    "cache-" + this.props.currentBook.key,
                    "zip",
                    cache
                  );
                  toast.success(this.props.t("Pre-caching successful"));
                } else {
                  toast.error(this.props.t("Pre-caching failed"));
                }
              });
            }}
          >
            <p className="action-name">
              <Trans>Pre-cache</Trans>
            </p>
          </div>
          <div
            className="action-dialog-edit"
            style={{ paddingLeft: "0px" }}
            onClick={async () => {
              await BookUtil.deleteBook(
                "cache-" + this.props.currentBook.key,
                "zip"
              );
              toast.success(this.props.t("Deletion successful"));
            }}
          >
            <p className="action-name">
              <Trans>Delete pre-cache</Trans>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default ActionDialog;
