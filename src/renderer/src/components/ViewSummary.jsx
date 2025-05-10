import TableComponent from './Table';

function ViewSummary({ content }) {
  console.log('ViewSummary', { content });

  return (
    <div style={style.container}>
      <TableComponent />
    </div>
  );
}

const style = {
  container: {
    paddingInline: '40px',
  },
};

export default ViewSummary;
