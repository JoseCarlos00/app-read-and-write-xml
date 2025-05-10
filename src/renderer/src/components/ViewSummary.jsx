import TableComponent from './Table';

function ViewSummary({ content }) {
  console.log('typeof content:', typeof content, { content });

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
