import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { 
  TextFormatter,
  NumberFormatter,
  CheckboxFormatter,
  DateFormatter,
  SingleSelectFormatter,
  MultipleSelectFormatter,
  CollaboratorFormatter,
  ImageFormatter,
  FileFormatter,
  LongTextFormatter,
  GeolocationFormatter,
  LinkFormatter,
  FormulaFormatter,
  CTimeFormatter,
  CreatorFormatter,
  LastModifierFormatter,
  MTimeFormatter
} from 'dtable-ui-component';
import { isValidEmail } from '../../utils/utils';
import intl from 'react-intl-universal';

const propTypes = {
  type: PropTypes.string,
  column: PropTypes.object.isRequired,
  selectedView: PropTypes.object,
  row: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
  CellType: PropTypes.object,
  collaborators: PropTypes.array,
  getLinkCellValue: PropTypes.func,
  getRowsByID: PropTypes.func,
  getTableById: PropTypes.func,
  getUserCommonInfo: PropTypes.func,
  getMediaUrl: PropTypes.func,
};

class EditorFormatter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isDataLoaded: false,
      collaborator: null
    }
  }

  componentDidMount() {
    const { row, column, CellType } = this.props;
    if (column.type === CellType.LAST_MODIFIER) {
      this.getCollaborator(row._last_modifier);
    }
    if (column.type === CellType.CREATOR) {
      this.getCollaborator(row._creator);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { row, column, CellType } = nextProps;
    if (column.type === CellType.LAST_MODIFIER) {
      this.getCollaborator(row._last_modifier);
    }
    if (column.type === CellType.CREATOR) {
      this.getCollaborator(row._creator);
    }
  }

  getCollaborator = (value) => {
    this.setState({isDataLoaded: false, collaborator: null});
    if (!value) {
      this.setState({isDataLoaded: true, collaborator: null});
      return;
    }
    let { collaborators } = this.props;
    let collaborator = collaborators && collaborators.find(c => c.email === value);
    if (collaborator) {
      this.setState({isDataLoaded: true, collaborator: collaborator});
      return;
    }

    if (!isValidEmail(value)) {
      let mediaUrl = this.props.getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({isDataLoaded: true, collaborator: collaborator});
      return;
    }
    
    this.props.getUserCommonInfo(value).then(res => {
      collaborator = res.data;
      this.setState({isDataLoaded: true, collaborator: collaborator});
    }).catch(() => {
      let mediaUrl = this.props.getMediaUrl();
      let defaultAvatarUrl = `${mediaUrl}/avatars/default.png`;
      collaborator = {
        name: value,
        avatar_url: defaultAvatarUrl,
      };
      this.setState({isDataLoaded: true, collaborator: collaborator});
    });
  }

  renderEmptyFormatter = () => {
    if (this.props.type === 'row_title') {
      return <span>{intl.get('Unnamed_record')}</span>;
    }
    return <span className="row-cell-empty d-inline-block"></span>;
  }

  renderFormatter = () => {
    const { column, row, collaborators, CellType } = this.props;
    let {type: columnType, key: columnKey} = column;
    const { isDataLoaded, collaborator } = this.state;
    const _this = this;
    
    switch(columnType) {
      case CellType.TEXT: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <TextFormatter value={row[columnKey]} containerClassName="gallery-text-editor" />;
      }
      case CellType.COLLABORATOR: {
        if (!row[columnKey] || row[columnKey].length === 0) return this.renderEmptyFormatter();
        return <CollaboratorFormatter value={row[columnKey]} collaborators={collaborators} />;
      }
      case CellType.LONG_TEXT: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <LongTextFormatter value={row[columnKey]} />;
      }
      case CellType.IMAGE: {
        if (!row[columnKey] || row[columnKey].length === 0) return this.renderEmptyFormatter();
        return <ImageFormatter value={row[columnKey]} isSample />;
      }
      case CellType.GEOLOCATION : {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <GeolocationFormatter value={row[columnKey]} containerClassName="gallery-text-editor" />;
      }
      case CellType.NUMBER: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <NumberFormatter value={row[columnKey]} format={column.data.format} />;
      }
      case CellType.DATE: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <DateFormatter value={row[columnKey]} format={column.data.format} />;
      }
      case CellType.MULTIPLE_SELECT: {
        if (!row[columnKey] || row[columnKey].length === 0) return this.renderEmptyFormatter();
        return <MultipleSelectFormatter value={row[columnKey]} options={column.data.options} />;
      }
      case CellType.SINGLE_SELECT: {
        if (!row[columnKey]) return this.renderEmptyFormatter();
        return <SingleSelectFormatter value={row[columnKey]} options={column.data.options} />;
      }
      case CellType.FILE: {
        if (!row[columnKey] || row[columnKey].length === 0) return this.renderEmptyFormatter();
        return <FileFormatter value={row[columnKey]} isSample />;
      }
      case CellType.CHECKBOX: {
        return <CheckboxFormatter value={row[columnKey]} />;
      }
      case CellType.CTIME: {
        if (!row._ctime) return this.renderEmptyFormatter();
        return <CTimeFormatter value={row._ctime} />;
      }
      case CellType.MTIME: {
        if (!row._mtime) return this.renderEmptyFormatter();
        return <MTimeFormatter value={row._mtime} />;
      }
      case CellType.CREATOR: {
        if (!row._creator || !collaborator) return this.renderEmptyFormatter();
        if (isDataLoaded) {
          return <CreatorFormatter collaborators={[collaborator]} value={row._creator} />;
        }
        return null
      }
      case CellType.LAST_MODIFIER: {
        if (!row._last_modifier || !collaborator) return this.renderEmptyFormatter();
        if (isDataLoaded) {
          return <LastModifierFormatter collaborators={[collaborator]} value={row._last_modifier} />;
        }
        return null
      }
      case CellType.FORMULA: {
        let formulaRows = this.props.selectedView.formula_rows;
        let formulaValue = formulaRows ? formulaRows[row._id][columnKey] : '';
        if (!formulaValue) return this.renderEmptyFormatter();
        return <FormulaFormatter value={formulaValue} resultType={column.data.result_type} containerClassName="gallery-formula-container" />;
      }
      case CellType.LINK: {
        let linkMetaData = {
          getLinkedCellValue: function(linkId, table1Id, table2Id, row_id) {
            return _this.props.getLinkCellValue(linkId, table1Id, table2Id, row_id);
          },
          getLinkedRows: function(tableId, rowIds) {
            return _this.props.getRowsByID(tableId, rowIds);
          },
          getLinkedTable: function(tableId) {
            return _this.props.getTableById(tableId);
          },
          expandLinkedTableRow: function(row, tableId) {
            return false
          }
        }
        return <LinkFormatter column={column} row={row} currentTableId={this.props.table._id} linkMetaData={linkMetaData} containerClassName="gallery-link-container" />;
      }
      default:
        return null
    }
  }

  render() {
    return(
      <Fragment>
        {this.renderFormatter()}
      </Fragment>
    );
  }
}

EditorFormatter.propTypes = propTypes;

export default EditorFormatter;